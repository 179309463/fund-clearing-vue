// 默认列配置
export const getDefaultColDef = () => ({
  resizable: true,
  sortable: true,
  flex: 1,
  minWidth: 100,
});

// 通用的展开列配置
export const getExpandColumnConfig = () => ({
  headerName: '',
  field: 'expand',
  cellRenderer: 'agGroupCellRenderer',
  width: 36,
  maxWidth: 36,
  minWidth: 36,
  resizable: false,
  suppressSizeToFit: true,
  pinned: 'left',
});

// 通用的复选框列配置
export const getCheckboxColumnConfig = (hasHeader = false) => ({
  headerName: '',
  field: 'selected',
  cellRenderer: 'CustomCheckboxRenderer',
  ...(hasHeader && { headerComponent: 'CustomCheckboxHeaderRenderer' }),
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
  valueGetter: (params: any) => params.data?.selected || false,
});

// 通用的数值列格式化器
export const numberFormatter = (params: any) => params.value?.toLocaleString() || '0';