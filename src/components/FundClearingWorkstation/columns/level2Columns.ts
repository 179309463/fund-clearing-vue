import { ColDef } from 'ag-grid-community';
import StatusBadge from '../../StatusBadge.vue';
import CustomCheckboxRenderer from '../../CustomCheckboxRenderer.vue';

// 第2层表格列定义（托管机构层）
export const getLevel2ColumnDefs = (): ColDef[] => [
  {
    headerName: '',
    field: 'expand',
    cellRenderer: 'agGroupCellRenderer',
    width: 36,
    maxWidth: 36,
    minWidth: 36,
    resizable: false,
    suppressSizeToFit: true,
    pinned: 'left',
  },
  {
    headerName: '',
    field: 'selected',
    cellRenderer: CustomCheckboxRenderer,
    width: 28,
    maxWidth: 28,
    minWidth: 28,
    resizable: false,
    suppressSizeToFit: true,
    pinned: 'left',
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0'
    } as any,
    headerClass: 'custom-checkbox-header',
    valueGetter: (params) => params.data?.selected || false,
  },
  {
    headerName: '托管机构',
    field: 'custodyInstitution',
    minWidth: 262,
    resizable: false,
    pinned: 'left',
  },
  {
    headerName: '自动清算状态',
    field: 'autoClearingStatus',
    cellRenderer: StatusBadge,
    cellRendererParams: {
      type: 'clearing'
    },
    minWidth: 120,
  },
  {
    headerName: '划款申请状态',
    field: 'transferApplicationStatus',
    cellRenderer: StatusBadge,
    cellRendererParams: {
      type: 'application'
    },
    minWidth: 120,
  },
  {
    headerName: '未办提醒',
    field: 'pendingReminder',
    cellRenderer: StatusBadge,
    cellRendererParams: {
      type: 'reminder'
    },
  },
  {
    headerName: '核算进度',
    field: 'accountingProgress',
    cellRenderer: StatusBadge,
    cellRendererParams: {
      type: 'progress'
    },
  },
  {
    headerName: '托管行进度',
    field: 'custodyProgress',
    cellRenderer: StatusBadge,
    cellRendererParams: {
      type: 'progress'
    },
  },
  {
    headerName: '账户余额',
    field: 'accountBalance',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
  },
  {
    headerName: '有效结算余额',
    field: 'effectiveSettlementBalance',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
  },
  {
    headerName: '统计有效已生成划款金额',
    field: 'generatedTransferAmount',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
    minWidth: 180,
  },
  {
    headerName: '统计有效未生成划款金额',
    field: 'ungeneratedTransferAmount',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
    minWidth: 180,
  },
];