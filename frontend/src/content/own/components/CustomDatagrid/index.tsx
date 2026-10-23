import {
  arSD,
  DataGrid,
  DataGridProps,
  GridLocaleText
} from '@mui/x-data-grid';
import { toLatinDigits } from '../../../../utils/locale';
import { useTranslation } from 'react-i18next';
import { lighten, Stack, Typography, useTheme } from '@mui/material';
import gridLocaleText from './GridLocaleText';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { useEffect, useMemo, useRef, useState } from 'react';
import { UiConfiguration } from '../../../../models/owns/uiConfiguration';
import type {
  GridColumns,
  GridEnrichedColDef
} from '@mui/x-data-grid/models/colDef/gridColDef';
import useAuth from '../../../../hooks/useAuth';

export type CustomDatagridColumn = GridEnrichedColDef & {
  uiConfigKey?: keyof Omit<UiConfiguration, 'id'>;
};
interface CustomDatagridProps extends DataGridProps {
  notClickable?: boolean;
  pro?: boolean;
  columns: CustomDatagridColumn[];
}

function CustomDataGrid(props: CustomDatagridProps) {
  const { t, i18n }: { t: any; i18n: any } = useTranslation();
  const theme = useTheme();
  const isArabic = (i18n.language || '').toLowerCase().startsWith('ar');
  const { height } = useWindowDimensions();
  const tableRef = useRef<HTMLDivElement>();
  const [tableHeight, setTableHeight] = useState<number>(500);
  const { user } = useAuth();

  const getTableHeight = () => {
    if (tableRef.current) {
      const viewportOffset = tableRef.current.getBoundingClientRect();
      // these are relative to the viewport, i.e. the window
      const top = viewportOffset.top;
      return height - top - 15;
    }
    return 500;
  };

  useEffect(() => {
    setTableHeight(getTableHeight());
  }, [tableRef.current]);

  const translatedGridLocaleText = useMemo(() => {
    if (!isArabic)
      return Object.fromEntries(
        Object.entries(gridLocaleText).map(([key, value]) => {
          if (typeof value === 'function') {
            return [key, value];
          }
          return [key, t(value)];
        })
      );
    // Arabic: MUI's Arabic DataGrid strings as the base, our own translations on top
    // (only where an Arabic translation really exists), Western digits everywhere.
    const arabicBase = arSD.components.MuiDataGrid.defaultProps
      .localeText as Partial<GridLocaleText>;
    const ownTranslations = Object.fromEntries(
      Object.entries(gridLocaleText).flatMap(([key, value]) =>
        typeof value === 'string' &&
        i18n.getResource(i18n.language, 'translation', value) !== undefined
          ? [[key, t(value)]]
          : []
      )
    );
    const merged = { ...arabicBase, ...ownTranslations };
    return Object.fromEntries(
      Object.entries(merged).map(([key, value]) =>
        typeof value === 'function'
          ? [key, (...args: any[]) => {
              const result = (value as (...a: any[]) => any)(...args);
              return typeof result === 'string' ? toLatinDigits(result) : result;
            }]
          : [key, value]
      )
    );
  }, [isArabic, i18n.language, t]);
  return (
    <div ref={tableRef} style={{ height: tableHeight, width: '100%' }}>
      {/*@ts-ignore*/}
      <DataGrid
        sx={{
          ' .MuiDataGrid-columnHeaders': {
            backgroundColor: lighten(theme.colors.primary.lighter, 0.45),
            borderBottom: `1px solid ${theme.colors.primary.lighter}`
          },
          ' .MuiDataGrid-columnHeader': {
            backgroundColor: lighten(theme.colors.primary.lighter, 0.45)
          },
          ' .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: theme.typography.pxToRem(13),
            color: theme.colors.alpha.black[70]
          },
          '.MuiDataGrid-row': {
            cursor: props.notClickable ? 'auto' : 'pointer',
            transition: 'background-color 0.15s ease'
          },
          '.MuiDataGrid-row:hover': {
            backgroundColor: lighten(theme.colors.primary.lighter, 0.55)
          },
          '.MuiDataGrid-cell': {
            borderBottomColor: theme.colors.alpha.black[10]
          }
        }}
        components={{
          NoRowsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              <Typography variant="h3">{t('no_content')}</Typography>
            </Stack>
          ),
          NoResultsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              <Typography variant="h3">{t('no_result_criteria')}</Typography>
            </Stack>
          )
        }}
        {...props}
        columns={props.columns.filter((col) =>
          col.uiConfigKey ? user.uiConfiguration[col.uiConfigKey] : true
        )}
        disableSelectionOnClick
        localeText={translatedGridLocaleText}
      />
    </div>
  );
}

export default CustomDataGrid;
