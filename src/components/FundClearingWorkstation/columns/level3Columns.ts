import { ColDef } from 'ag-grid-community';
import StatusBadge from '../../StatusBadge.vue';
import CustomCheckboxRenderer from '../../CustomCheckboxRenderer.vue';

// 第3层表格列定义（划款指令层）
export const getLevel3ColumnDefs = (): ColDef[] => [
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
    headerName: '划款指令编号',
    field: 'transferInstructionNumber',
    minWidth: 230,
    resizable: false,
    pinned: 'left',
  },
  {
    headerName: '划款指令金额',
    field: 'transferInstructionAmount',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
  },
  {
    headerName: '划款进度',
    field: 'transferProgress',
    cellRenderer: StatusBadge,
    cellRendererParams: {
      type: 'progress'
    },
  },
];