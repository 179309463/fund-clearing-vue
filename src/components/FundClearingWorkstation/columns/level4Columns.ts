import { ColDef } from 'ag-grid-community';
import StatusBadge from '../../StatusBadge.vue';
import CustomCheckboxRenderer from '../../CustomCheckboxRenderer.vue';

// 第4层表格列定义（成交单层）
export const getLevel4ColumnDefs = (): ColDef[] => [
  {
    headerName: '',
    field: 'indent',
    width: 36,
    maxWidth: 36,
    minWidth: 36,
    resizable: false,
    suppressSizeToFit: true,
    pinned: 'left',
    cellRenderer: () => '',
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
    headerName: '成交单编号',
    field: 'tradeOrderNumber',
    minWidth: 150,
    resizable: false,
    pinned: 'left',
  },
  {
    headerName: '指令状态',
    field: 'instructionStatus',
    cellRenderer: (params: any) => {
      const status = params.value;
      const type = 'instruction';
      const getStatusClass = (status: string, type: string) => {
        switch (type) {
          case 'instruction':
            return status === '已生成' ? 'status-success' :
                   status === '未生成' ? 'status-warning' :
                   'status-default';
          default:
            return 'status-default';
        }
      };
      return `<span class="status-badge ${getStatusClass(status, type)}">${status}</span>`;
    },
  },
  {
    headerName: '有效状态',
    field: 'validStatus',
    cellRenderer: (params: any) => {
      const status = params.value;
      const type = 'valid';
      const getStatusClass = (status: string, type: string) => {
        switch (type) {
          case 'valid':
            return status === '正常' ? 'status-success' :
                   status === '异常' ? 'status-error' :
                   'status-default';
          default:
            return 'status-default';
        }
      };
      return `<span class="status-badge ${getStatusClass(status, type)}">${status}</span>`;
    },
  },
  {
    headerName: '资金结算状态',
    field: 'fundSettlementStatus',
    cellRenderer: (params: any) => {
      const status = params.value;
      const type = 'settlement';
      const getStatusClass = (status: string, type: string) => {
        switch (type) {
          case 'settlement':
            return status === '成功' ? 'status-success' :
                   status === '失败' ? 'status-error' :
                   status === '处理中' ? 'status-info' :
                   'status-default';
          default:
            return 'status-default';
        }
      };
      return `<span class="status-badge ${getStatusClass(status, type)}">${status}</span>`;
    },
  },
  {
    headerName: '交易类型',
    field: 'tradeType',
  },
  {
    headerName: '交易品种代码',
    field: 'tradeVarietyCode',
    minWidth: 120,
  },
  {
    headerName: '交易品种',
    field: 'tradeVariety',
    minWidth: 120,
  },
  {
    headerName: '债券名称',
    field: 'bondName',
    minWidth: 150,
  },
  {
    headerName: '结算日期',
    field: 'settlementDate',
    minWidth: 120,
  },
  {
    headerName: '结算方式',
    field: 'settlementMethod',
    minWidth: 120,
  },
  {
    headerName: '结算金额',
    field: 'settlementAmount',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
  },
  {
    headerName: '用途',
    field: 'purpose',
  },
];