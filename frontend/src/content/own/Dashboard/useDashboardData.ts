import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { startOfDay, subDays } from 'date-fns';
import api from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';
import { FilterField, Page, SearchCriteria } from '../../../models/owns/page';
import WorkOrder from '../../../models/owns/workOrder';
import { WorkOrderBaseMiniDTO } from '../../../models/owns/workOrderBase';
import Request from '../../../models/owns/request';
import { AssetOverviewStats } from '../../../models/owns/analytics/asset';
import { PermissionEntity } from '../../../models/owns/role';
import { PlanFeature } from '../../../models/owns/subscriptionPlan';

export const TREND_DAYS = 30;
const ACTIVE_STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD'];
const LIST_SIZE = 6;
const REQUESTS_SIZE = 5;
const TREND_PAGE_SIZE = 500;

export interface DashboardCounts {
  open: number;
  inProgress: number;
  onHold: number;
  overdue: number;
}

export interface TrendPoint {
  date: Date;
  created: number;
  completed: number;
}

export interface PmCompliance {
  total: number;
  compliant: number;
}

export interface DashboardAccess {
  workOrders: boolean;
  requests: boolean;
  assets: boolean;
  preventive: boolean;
  analytics: boolean;
  createWorkOrder: boolean;
  createRequest: boolean;
  createAsset: boolean;
}

const notArchived: FilterField = {
  field: 'archived',
  operation: 'eq',
  value: false
};

const statusIn = (values: string[]): FilterField => ({
  field: 'status',
  operation: 'in',
  values,
  value: '',
  enumName: 'STATUS'
});

const countCriteria = (filterFields: FilterField[]): SearchCriteria => ({
  filterFields,
  pageNum: 0,
  pageSize: 1
});

const searchWorkOrders = (criteria: SearchCriteria) =>
  api.post<Page<WorkOrder>>('work-orders/search', criteria);

const countWorkOrders = (filterFields: FilterField[]) =>
  searchWorkOrders(countCriteria(filterFields)).then(
    (page) => page.totalElements
  );

const isCompliant = (workOrder: WorkOrder): boolean =>
  !workOrder.dueDate ||
  !workOrder.completedOn ||
  new Date(workOrder.completedOn).getTime() <=
    new Date(workOrder.dueDate).getTime();

const dayKey = (date: Date): number => startOfDay(date).getTime();

export default function useDashboardData() {
  const { user, hasViewPermission, hasCreatePermission, hasFeature } =
    useAuth();

  const access: DashboardAccess = useMemo(
    () => ({
      workOrders: hasViewPermission(PermissionEntity.WORK_ORDERS),
      requests:
        hasViewPermission(PermissionEntity.REQUESTS) &&
        user?.role?.code !== 'REQUESTER',
      assets: hasViewPermission(PermissionEntity.ASSETS),
      preventive:
        hasViewPermission(PermissionEntity.WORK_ORDERS) &&
        hasFeature(PlanFeature.PREVENTIVE_MAINTENANCE),
      analytics:
        hasViewPermission(PermissionEntity.ANALYTICS) &&
        hasFeature(PlanFeature.ANALYTICS),
      createWorkOrder: hasCreatePermission(PermissionEntity.WORK_ORDERS),
      createRequest: hasCreatePermission(PermissionEntity.REQUESTS),
      createAsset: hasCreatePermission(PermissionEntity.ASSETS)
    }),
    [user?.id, user?.role?.id]
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [urgent, setUrgent] = useState<WorkOrder[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [completedInRange, setCompletedInRange] = useState<number>(0);
  const [pmCompliance, setPmCompliance] = useState<PmCompliance | null>(
    null
  );
  const [requests, setRequests] = useState<Request[]>([]);
  const [pendingRequests, setPendingRequests] = useState<number | null>(
    null
  );
  const [assetStats, setAssetStats] = useState<AssetOverviewStats | null>(
    null
  );
  const runId = useRef<number>(0);

  const load = useCallback(async () => {
    const current = ++runId.current;
    setLoading(true);
    const now = new Date();
    const rangeStart = startOfDay(subDays(now, TREND_DAYS - 1));
    const nowIso = now.toISOString();
    const startIso = rangeStart.toISOString();

    const woTasks = access.workOrders
      ? Promise.allSettled([
          countWorkOrders([notArchived, statusIn(['OPEN'])]),
          countWorkOrders([notArchived, statusIn(['IN_PROGRESS'])]),
          countWorkOrders([notArchived, statusIn(['ON_HOLD'])]),
          // Overdue: active and due date already passed (sorted oldest due first)
          searchWorkOrders({
            filterFields: [
              notArchived,
              statusIn(ACTIVE_STATUSES),
              {
                field: 'dueDate',
                operation: 'le',
                value: nowIso,
                enumName: 'JS_DATE'
              }
            ],
            pageNum: 0,
            pageSize: LIST_SIZE,
            sortField: 'dueDate',
            direction: 'ASC'
          }),
          // Urgent: active high priority, nearest due date first
          searchWorkOrders({
            filterFields: [
              notArchived,
              statusIn(ACTIVE_STATUSES),
              {
                field: 'priority',
                operation: 'in',
                values: ['HIGH'],
                value: '',
                enumName: 'PRIORITY'
              }
            ],
            pageNum: 0,
            pageSize: LIST_SIZE,
            sortField: 'dueDate',
            direction: 'ASC'
          }),
          // Created in range
          api.post<Page<WorkOrderBaseMiniDTO>>('work-orders/search/mini', {
            filterFields: [
              {
                field: 'createdAt',
                operation: 'ge',
                value: startIso,
                enumName: 'JS_DATE'
              }
            ],
            pageNum: 0,
            pageSize: TREND_PAGE_SIZE,
            sortField: 'createdAt',
            direction: 'DESC'
          } as SearchCriteria),
          // Completed in range
          searchWorkOrders({
            filterFields: [
              statusIn(['COMPLETE']),
              {
                field: 'completedOn',
                operation: 'ge',
                value: startIso,
                enumName: 'JS_DATE'
              }
            ],
            pageNum: 0,
            pageSize: TREND_PAGE_SIZE,
            sortField: 'completedOn',
            direction: 'DESC'
          })
        ])
      : Promise.resolve(null);

    const requestTasks = access.requests
      ? Promise.allSettled([
          api.post<Page<Request>>('requests/search', {
            filterFields: [],
            pageNum: 0,
            pageSize: REQUESTS_SIZE,
            sortField: 'createdAt',
            direction: 'DESC'
          } as SearchCriteria),
          api.get<{ success: boolean; message: string }>('requests/pending')
        ])
      : Promise.resolve(null);

    const assetTask =
      access.assets && access.analytics
        ? api
            .post<AssetOverviewStats>('analytics/assets/overview', {
              start: rangeStart,
              end: now
            })
            .catch(() => null)
        : Promise.resolve(null);

    const [woResults, requestResults, assetResult] = await Promise.all([
      woTasks,
      requestTasks,
      assetTask
    ]);
    if (current !== runId.current) return;

    if (woResults) {
      const value = <T>(index: number, fallback: T): T => {
        const result = woResults[index];
        return result.status === 'fulfilled'
          ? (result.value as unknown as T)
          : fallback;
      };
      const overduePage = value<Page<WorkOrder> | null>(3, null);
      const highPage = value<Page<WorkOrder> | null>(4, null);
      const createdPage = value<Page<WorkOrderBaseMiniDTO> | null>(5, null);
      const completedPage = value<Page<WorkOrder> | null>(6, null);

      setCounts({
        open: value<number>(0, 0),
        inProgress: value<number>(1, 0),
        onHold: value<number>(2, 0),
        overdue: overduePage?.totalElements ?? 0
      });

      const seen = new Set<number>();
      const merged: WorkOrder[] = [];
      [...(overduePage?.content ?? []), ...(highPage?.content ?? [])].forEach(
        (workOrder) => {
          if (seen.has(workOrder.id) || merged.length >= LIST_SIZE) return;
          seen.add(workOrder.id);
          merged.push(workOrder);
        }
      );
      setUrgent(merged);

      // Build day buckets
      const buckets = new Map<number, TrendPoint>();
      for (let i = 0; i < TREND_DAYS; i++) {
        const date = startOfDay(subDays(now, TREND_DAYS - 1 - i));
        buckets.set(date.getTime(), { date, created: 0, completed: 0 });
      }
      (createdPage?.content ?? []).forEach((workOrder) => {
        const bucket = buckets.get(dayKey(new Date(workOrder.createdAt)));
        if (bucket) bucket.created += 1;
      });
      const completed = completedPage?.content ?? [];
      completed.forEach((workOrder) => {
        if (!workOrder.completedOn) return;
        const bucket = buckets.get(dayKey(new Date(workOrder.completedOn)));
        if (bucket) bucket.completed += 1;
      });
      setTrend(Array.from(buckets.values()));
      setCompletedInRange(completedPage?.totalElements ?? completed.length);

      if (access.preventive) {
        const preventive = completed.filter(
          (workOrder) => !!workOrder.parentPreventiveMaintenance
        );
        setPmCompliance({
          total: preventive.length,
          compliant: preventive.filter(isCompliant).length
        });
      } else setPmCompliance(null);
    }

    if (requestResults) {
      const [listResult, pendingResult] = requestResults;
      setRequests(
        listResult.status === 'fulfilled' ? listResult.value.content : []
      );
      setPendingRequests(
        pendingResult.status === 'fulfilled'
          ? Number(pendingResult.value.message) || 0
          : null
      );
    }

    setAssetStats(assetResult);
    setLoading(false);
  }, [access]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    access,
    loading,
    counts,
    urgent,
    trend,
    completedInRange,
    pmCompliance,
    requests,
    pendingRequests,
    assetStats,
    reload: load
  };
}
