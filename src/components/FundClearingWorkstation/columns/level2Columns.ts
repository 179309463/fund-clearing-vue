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
    cellRenderer: (params: any) => {
      const status = params.value;
      const type = 'clearing';
      const getStatusClass = (status: string, type: string) => {
        switch (type) {
          case 'clearing':
            return status === '已开启' ? 'status-success' :
                   status === '已生成' ? 'status-info' :
                   'status-default';
          default:
            return 'status-default';
        }
      };
      return `<span class="status-badge ${getStatusClass(status, type)}">${status}</span>`;
    },
    minWidth: 120,
  },
  {
    headerName: '划款申请状态',
    field: 'transferApplicationStatus',
    cellRenderer: (params: any) => {
      const status = params.value;
      const type = 'application';
      const getStatusClass = (status: string, type: string) => {
        switch (type) {
          case 'application':
            return status === '已生成' ? 'status-success' :
                   status === '未生成' ? 'status-warning' :
                   'status-default';
          default:
            return 'status-default';
        }
      };
      return `<span class="status-badge ${getStatusClass(status, type)}">${status}</span>`;
    },
    minWidth: 120,
  },
  {
    headerName: '未办提醒',
    field: 'pendingReminder',
    cellRenderer: (params: any) => {
      const status = params.value;
      const type = 'reminder';
      const getStatusClass = (status: string, type: string) => {
        switch (type) {
          case 'reminder':
            return status === '未办' ? 'status-error' :
                   status === '已办' ? 'status-success' :
                   'status-default';
          default:
            return 'status-default';
        }
      };
      return `<span class="status-badge ${getStatusClass(status, type)}">${status}</span>`;
    },
  },
  {
    headerName: '核算进度',
    field: 'accountingProgress',
    cellRenderer: (params: any) => {
      const status = params.value;
      const type = 'progress';
      const getStatusClass = (status: string, type: string) => {
        switch (type) {
          case 'progress':
            return status === '进行中' ? 'status-info' :
                   status === '已完成' ? 'status-success' :
                   status === '超时' ? 'status-error' :
                   'status-default';
          default:
            return 'status-default';
        }
      };
      return `<span class="status-badge ${getStatusClass(status, type)}">${status}</span>`;
    },
  },
  {
    headerName: '托管行进度',
    field: 'custodyProgress',
    cellRenderer: (params: any) => {
      const status = params.value;
      const type = 'progress';
      const getStatusClass = (status: string, type: string) => {
        switch (type) {
          case 'progress':
            return status === '进行中' ? 'status-info' :
                   status === '已完成' ? 'status-success' :
                   status === '超时' ? 'status-error' :
                   'status-default';
          default:
            return 'status-default';
        }
      };
      return `<span class="status-badge ${getStatusClass(status, type)}">${status}</span>`;
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