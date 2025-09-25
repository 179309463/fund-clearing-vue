import { useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { getLevel2ColumnDefs, getLevel3ColumnDefs, getLevel4ColumnDefs, getDefaultColDef } from './columns';

// 表格配置 Hook
export const useGridConfig = (
  gridInstances: React.MutableRefObject<Set<any>>,
  updateSelectionCounts: () => void,
  onRowDoubleClicked: (event: any) => void
) => {
  const defaultColDef = useMemo(() => getDefaultColDef(), []);
  const level2ColumnDefs = useMemo(() => getLevel2ColumnDefs(), []);
  const level3ColumnDefs = useMemo(() => getLevel3ColumnDefs(), []);
  const level4ColumnDefs = useMemo(() => getLevel4ColumnDefs(), []);

  // 详情单元格渲染器参数配置
  const detailCellRendererParams = useMemo(() => ({
    detailGridOptions: {
      columnDefs: level2ColumnDefs,
      defaultColDef: {
        ...defaultColDef,
        suppressSizeToFit: false,
      },
      masterDetail: true,
      detailRowAutoHeight: true,
      suppressCellFocus: true,
      groupDefaultExpanded: -1,
      onGridReady: (params: any) => {
        gridInstances.current.add(params.api);
      },
      onSelectionChanged: updateSelectionCounts,
      onRowDoubleClicked: onRowDoubleClicked,
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: level3ColumnDefs,
          defaultColDef: {
            ...defaultColDef,
            suppressSizeToFit: false,
          },
          masterDetail: true,
          detailRowAutoHeight: true,
          suppressCellFocus: true,
          groupDefaultExpanded: -1,
          onGridReady: (params: any) => {
            gridInstances.current.add(params.api);
          },
          onSelectionChanged: updateSelectionCounts,
          onRowDoubleClicked: onRowDoubleClicked,
          detailCellRendererParams: {
            detailGridOptions: {
              columnDefs: level4ColumnDefs,
              defaultColDef: {
                ...defaultColDef,
                suppressSizeToFit: false,
              },
              detailRowAutoHeight: true,
              suppressCellFocus: true,
              onGridReady: (params: any) => {
                gridInstances.current.add(params.api);
              },
              onSelectionChanged: updateSelectionCounts,
            },
            getDetailRowData: (params: any) => {
              params.successCallback(params.data.children || []);
            },
          },
        },
        getDetailRowData: (params: any) => {
          params.successCallback(params.data.children || []);
        },
      },
    },
    getDetailRowData: (params: any) => {
      params.successCallback(params.data.children || []);
    },
  }), [level2ColumnDefs, level3ColumnDefs, level4ColumnDefs, defaultColDef, updateSelectionCounts, onRowDoubleClicked, gridInstances]);

  return {
    defaultColDef,
    detailCellRendererParams,
  };
};