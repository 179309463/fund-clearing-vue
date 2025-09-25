import React from 'react';
import { ColDef } from 'ag-grid-community';
import CustomCheckboxRenderer from '../../CustomCheckboxRenderer';
import CustomCheckboxHeaderRenderer from '../../CustomCheckboxHeaderRenderer';

// 第1层表格列定义（基金层）
export const getLevel1ColumnDefs = (): ColDef[] => [
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
    headerComponent: CustomCheckboxHeaderRenderer,
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
    headerName: '基金代码',
    field: 'fundCode',
    width: 120,
    maxWidth: 120,
    resizable: false,
    suppressSizeToFit: true,
    pinned: 'left',
  },
  {
    headerName: '基金名称',
    field: 'fundName',
    width: 173,
    maxWidth: 173,
    resizable: false,
    suppressSizeToFit: true,
    pinned: 'left',
  },
  {
    headerName: 'OSS银行头寸',
    field: 'ossBankBalance',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
  },
  {
    headerName: '日终活期银行存款',
    field: 'endDayBankDeposit',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
  },
  {
    headerName: '日终活期银行存款(含询价结果未成)',
    field: 'endDayBankDepositWithInquiry',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
    minWidth: 200,
  },
  {
    headerName: '托管行',
    field: 'custodyBank',
    minWidth: 150,
  },
  {
    headerName: '交易员1',
    field: 'trader1',
    minWidth: 100,
  },
  {
    headerName: '交易员2',
    field: 'trader2',
    minWidth: 100,
  },
  {
    headerName: '需补划出金额(元)',
    field: 'requiredTransferAmount',
    type: 'numericColumn',
    valueFormatter: (params) => params.value?.toLocaleString() || '0',
    cellStyle: { color: '#ef4444', fontWeight: 'bold' },
    minWidth: 150,
  },
];