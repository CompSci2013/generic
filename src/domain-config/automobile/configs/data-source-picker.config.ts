import { TablePickerConfig } from '../../../app/framework/components/table-picker/models/table-picker-config';

/**
 * Data Source item for picker table
 */
export interface DataSourceItem {
  value: string;
  name: string;
  count?: number;
}

/**
 * Table-based picker configuration for Data Sources
 *
 * Displays data sources in a table with checkboxes for selection
 */
export const DATA_SOURCE_PICKER_CONFIG: TablePickerConfig<DataSourceItem> = {
  id: 'data-source-picker',
  displayName: 'Data Source',

  columns: [
    {
      field: 'name',
      header: 'Name',
      sortable: true,
      width: '60%',
    },
    {
      field: 'value',
      header: 'Value',
      sortable: true,
      width: '40%',
    },
  ],

  selection: {
    urlParam: 'dataSource',

    // Serialize selected items to comma-separated values
    serializer: (items: DataSourceItem[]) => {
      return items.map((i) => i.value).join(',');
    },

    // Deserialize URL string to item objects
    deserializer: (urlValue: string) => {
      if (!urlValue || urlValue.trim() === '') {
        return [];
      }
      return urlValue.split(',').map((value) => ({
        value: value.trim(),
      }));
    },

    // Generate unique key for each row
    keyGenerator: (item: DataSourceItem) => item.value,

    // Parse key back to item (for hydration from URL)
    keyParser: (key: string) => ({
      value: key,
    }),
  },

  pagination: {
    mode: 'client',
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20],
  },

  // Static data (can be replaced with loadData function)
  data: [
    {
      value: 'nhtsa_vpic_large_sample',
      name: 'NHTSA VPIC Large Sample',
      count: 4200,
    },
    {
      value: 'synthetic_historical',
      name: 'Synthetic Historical',
      count: 687,
    },
  ],
};
