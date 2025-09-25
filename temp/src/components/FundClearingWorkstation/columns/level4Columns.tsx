import React from 'react';
import { ColDef } from 'ag-grid-community';
import StatusBadge from '../../StatusBadge';
import CustomCheckboxRenderer from '../../CustomCheckboxRenderer';

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
    cellRenderer: (params: any) => <StatusBadge status={params.value} type="instruction" />,
  },
  {
    headerName: '有效状态',
    field: 'validStatus',
    cellRenderer: (params: any) => <StatusBadge status={params.value} type="valid" />,
  },
  {
    headerName: '资金结算状态',
    field: 'fundSettlementStatus',
    cellRenderer: (params: any) => <StatusBadge status={params.value} type="settlement" />,
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