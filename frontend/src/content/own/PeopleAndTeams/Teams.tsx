import {
  Box,
  debounce,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ListToolbar } from '../components/ListPageShell';
import Form from '../components/form';
import FormDialogTitle from '../components/form/FormDialogTitle';
import * as Yup from 'yup';
import { IField } from '../type';
import CustomDataGrid from '../components/CustomDatagrid';
import Team from '../../../models/owns/team';
import {
  GridEnrichedColDef,
  GridRenderCellParams,
  GridToolbar
} from '@mui/x-data-grid';
import { Close } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';
import SectionCard from '../components/SectionCard';
import { SoftChip } from '../components/StatusChip';
import {
  DetailRow,
  DetailRowText,
  DetailsHeader,
  EmptyCardBody
} from '../components/DetailsKit';
import { isNumeric } from 'src/utils/validators';
import { useParams } from 'react-router-dom';
import {
  addTeam,
  clearSingleTeam,
  deleteTeam,
  editTeam,
  getSingleTeam,
  getTeams
} from '../../../slices/team';
import { useDispatch, useSelector } from '../../../store';
import ConfirmDialog from '../components/ConfirmDialog';
import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { formatSelectMultiple } from '../../../utils/formatters';
import { UserMiniDTO } from '../../../models/user';
import UserAvatars from '../components/UserAvatars';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/owns/role';
import NoRowsMessage from '../components/NoRowsMessage';
import { SearchCriteria, SortDirection } from '../../../models/owns/page';
import { onSearchQueryChange } from '../../../utils/overall';
import SearchInput from '../components/SearchInput';
import { getUserUrl } from '../../../utils/urlPaths';

interface PropsType {
  values?: any;
  openModal: boolean;
  handleCloseModal: () => void;
}

const Teams = ({ openModal, handleCloseModal }: PropsType) => {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [currentTeam, setCurrentTeam] = useState<Team>();
  const { teams, loadingGet, singleTeam } = useSelector((state) => state.teams);
  const [openDrawerFromUrl, setOpenDrawerFromUrl] = useState<boolean>(false);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    filterFields: [],
    pageSize: 10,
    pageNum: 0
  });
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { hasEditPermission, hasDeletePermission } = useAuth();
  const [isTeamDetailsOpen, setIsTeamDetailsOpen] = useState(false);
  const [viewOrUpdate, setViewOrUpdate] = useState<'view' | 'update'>('view');
  const { teamId } = useParams();

  const onQueryChange = (event) => {
    onSearchQueryChange<Team>(event, criteria, setCriteria, [
      'name',
      'description'
    ]);
  };
  const debouncedQueryChange = useMemo(() => debounce(onQueryChange, 1300), []);

  useEffect(() => {
    if (teamId && isNumeric(teamId)) {
      dispatch(getSingleTeam(Number(teamId)));
    }
  }, [teamId]);

  useEffect(() => {
    dispatch(getTeams(criteria));
  }, [criteria]);

  //see changes in ui on edit
  useEffect(() => {
    if (singleTeam || teams.content.length) {
      const currentInContent = teams.content.find(
        (team) => team.id === currentTeam?.id
      );
      const updatedTeam = currentInContent ?? singleTeam;
      if (updatedTeam) {
        if (openDrawerFromUrl) {
          setCurrentTeam(updatedTeam);
        } else {
          handleOpenModal(updatedTeam);
          setOpenDrawerFromUrl(true);
        }
      }
    }
    return () => {
      dispatch(clearSingleTeam());
    };
  }, [singleTeam, teams]);

  const onPageSizeChange = (size: number) => {
    setCriteria({ ...criteria, pageSize: size });
  };
  const onPageChange = (number: number) => {
    setCriteria({ ...criteria, pageNum: number });
  };

  const handleDelete = (id: number) => {
    dispatch(deleteTeam(id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const onCreationSuccess = () => {
    handleCloseModal();
    showSnackBar(t('team_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(t('team_create_failure'), 'error');
  const onEditSuccess = () => {
    setOpenUpdateModal(false);
    showSnackBar(t('changes_saved_success'), 'success');
  };
  const onEditFailure = (err) => showSnackBar(t('team_edit_failure'), 'error');
  const onDeleteSuccess = () => {
    showSnackBar(t('team_delete_success'), 'success');
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('team_delete_failure'), 'error');
  let fields: Array<IField> = [
    {
      name: 'name',
      type: 'text',
      label: t('name'),
      placeholder: t('team_name'),
      required: true
    },
    {
      name: 'description',
      type: 'text',
      multiple: true,
      label: t('description'),
      placeholder: t('description')
    },
    {
      name: 'users',
      type: 'select',
      type2: 'user',
      multiple: true,
      label: t('people_in_team'),
      placeholder: t('people_in_team')
    }
  ];

  const shape = {
    name: Yup.string().required('required_team_name')
  };

  const columns: GridEnrichedColDef[] = [
    {
      field: 'name',
      headerName: t('team_name'),
      width: 150,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Box sx={{ fontWeight: 'bold' }}>{params.value}</Box>
      )
    },
    {
      field: 'description',
      headerName: t('description'),
      width: 300
    },
    {
      field: 'users',
      headerName: t('people_in_team'),
      width: 200,
      renderCell: (params: GridRenderCellParams<UserMiniDTO[]>) => (
        <UserAvatars compact={false} users={params.value} />
      )
    }
  ];
  const handleOpenModal = (team: Team) => {
    setCurrentTeam(team);
    window.history.replaceState(
      null,
      'Team details',
      `/app/people-teams/teams/${team.id}`
    );
    setIsTeamDetailsOpen(true);
  };
  const handleOpenDetails = (id: number) => {
    const foundTeam = teams.content.find((team) => team.id === id);
    if (foundTeam) {
      handleOpenModal(foundTeam);
    }
  };
  const handleCloseDetails = () => {
    window.history.replaceState(null, 'Team', `/app/people-teams/teams`);
    setIsTeamDetailsOpen(false);
  };

  const RenderTeamsAddModal = () => (
    <Dialog fullWidth maxWidth="md" open={openModal} onClose={handleCloseModal}>
      <FormDialogTitle
        title={t('create_team')}
        subtitle={t('create_team_description')}
        onClose={handleCloseModal}
      />

      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={fields}
            validation={Yup.object().shape(shape)}
            submitText={t('submit')}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              const newValues = { ...values };
              newValues.users = formatSelectMultiple(newValues.users);
              return dispatch(addTeam(newValues))
                .then(onCreationSuccess)
                .catch(onCreationFailure);
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );

  const Renderteams = () => (
    <Box
      sx={{
        width: '95%'
      }}
    >
      {teams.content.length !== 0 ? (
        <CustomDataGrid
          pageSize={criteria.pageSize}
          page={criteria.pageNum}
          rows={teams.content}
          rowCount={teams.totalElements}
          pagination
          paginationMode="server"
          sortingMode="server"
          onPageSizeChange={onPageSizeChange}
          onPageChange={onPageChange}
          rowsPerPageOptions={[10, 20, 50]}
          columns={columns}
          onSortModelChange={(model) => {
            if (model.length === 0) {
              setCriteria({
                ...criteria,
                sortField: undefined,
                direction: undefined
              });
              return;
            }

            const fieldMapping = {
              name: 'name',
              description: 'description',
              users: 'users.firstName'
            };

            const field = model[0].field;
            const mappedField = fieldMapping[field];

            if (!mappedField) return;

            setCriteria({
              ...criteria,
              sortField: mappedField,
              direction: (model[0].sort?.toUpperCase() ||
                'ASC') as SortDirection
            });
          }}
          components={{
            Toolbar: GridToolbar
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {}
            }
          }}
          onRowClick={(params) => {
            handleOpenDetails(Number(params.id));
          }}
        />
      ) : (
        <NoRowsMessage
          message={t('noRows.team.message')}
          action={t('noRows.team.action')}
        />
      )}
    </Box>
  );

  const ModalTeamDetails = () => (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={isTeamDetailsOpen}
      onClose={handleCloseDetails}
    >
      <DialogTitle component="div" sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
        <DetailsHeader
          subtitle={t('team')}
          title={currentTeam?.name}
          chips={
            currentTeam ? (
              <SoftChip
                tone="primary"
                size="medium"
                label={`${currentTeam.users?.length ?? 0} ${t('members')}`}
              />
            ) : undefined
          }
          actions={
            <>
              {viewOrUpdate === 'view' ? (
                hasEditPermission(
                  PermissionEntity.PEOPLE_AND_TEAMS,
                  currentTeam
                ) && (
                  <IconButton
                    aria-label={t('edit')}
                    onClick={() => setViewOrUpdate('update')}
                  >
                    <EditTwoToneIcon fontSize="small" color="primary" />
                  </IconButton>
                )
              ) : (
                <IconButton
                  aria-label={t('go_back')}
                  onClick={() => setViewOrUpdate('view')}
                >
                  <ArrowBackTwoToneIcon
                    fontSize="small"
                    sx={{
                      transform: (theme) =>
                        theme.direction === 'rtl' ? 'scaleX(-1)' : 'none'
                    }}
                  />
                </IconButton>
              )}
              {hasDeletePermission(
                PermissionEntity.PEOPLE_AND_TEAMS,
                currentTeam
              ) && (
                <IconButton
                  aria-label={t('to_delete')}
                  onClick={() => {
                    setIsTeamDetailsOpen(false);
                    setOpenDelete(true);
                  }}
                >
                  <DeleteTwoToneIcon fontSize="small" color="error" />
                </IconButton>
              )}
              <IconButton aria-label="close" onClick={handleCloseDetails}>
                <Close fontSize="small" />
              </IconButton>
            </>
          }
        />
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        {viewOrUpdate === 'view' ? (
          <Stack spacing={2.5}>
            {currentTeam?.description && (
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  textAlign: 'start'
                }}
              >
                {currentTeam.description}
              </Typography>
            )}
            <SectionCard
              title="members"
              icon={<PeopleAltTwoToneIcon fontSize="small" />}
              noPadding
            >
              {currentTeam?.users.length ? (
                <Box>
                  {currentTeam.users.map((user) => (
                    <DetailRow key={user.id}>
                      <Avatar
                        src={user.image?.url}
                        sx={{ width: 34, height: 34, fontSize: 14 }}
                      >
                        {user.firstName?.[0]?.toUpperCase()}
                      </Avatar>
                      <DetailRowText
                        primary={
                          <Link href={getUserUrl(user.id)} underline="hover">
                            {`${user.firstName} ${user.lastName}`}
                          </Link>
                        }
                      />
                    </DetailRow>
                  ))}
                </Box>
              ) : (
                <EmptyCardBody message="—" />
              )}
            </SectionCard>
          </Stack>
        ) : (
          <Box>
            <Form
              fields={fields}
              validation={Yup.object().shape(shape)}
              submitText={t('save')}
              values={
                {
                  ...currentTeam,
                  users: currentTeam.users.map((user) => {
                    return {
                      label: `${user.firstName} ${user.lastName}`,
                      value: user.id
                    };
                  })
                } || {}
              }
              onChange={({ field, e }) => {}}
              onSubmit={async (values) => {
                values.users = formatSelectMultiple(values.users);
                return dispatch(editTeam(currentTeam.id, values))
                  .then(() => {
                    onEditSuccess();
                    setViewOrUpdate('view');
                  })
                  .catch(onEditFailure);
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box
      sx={{
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <RenderTeamsAddModal />
      <ModalTeamDetails />
      {Boolean(teams.content.length) && (
        <Box sx={{ width: '100%', px: 2 }}>
          <ListToolbar bare>
            <SearchInput onChange={debouncedQueryChange} />
          </ListToolbar>
        </Box>
      )}
      {Renderteams()}
      <ConfirmDialog
        open={openDelete}
        onCancel={() => {
          setOpenDelete(false);
          setIsTeamDetailsOpen(true);
        }}
        onConfirm={() => handleDelete(currentTeam?.id)}
        confirmText={t('to_delete')}
        question={t('confirm_delete_team')}
      />
    </Box>
  );
};

export default Teams;
