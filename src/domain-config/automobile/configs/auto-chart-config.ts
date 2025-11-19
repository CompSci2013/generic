import { AutoStatistics } from '../models';

/**
 * Chart configuration interface.
 * This matches the generic ChartConfig<T> interface from the framework.
 */
export interface ChartConfig<T> {
  /** Unique chart identifier */
  id: string;
  /** Chart title */
  title: string;
  /** Chart type */
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  /** Function to select data from source */
  dataSelector: (data: T) => any[];
  /** X-axis field (for bar/line charts) */
  xField?: string;
  /** Y-axis field (for bar/line charts) */
  yField?: string;
  /** Label field (for pie/doughnut charts) */
  labelField?: string;
  /** Value field (for pie/doughnut charts) */
  valueField?: string;
  /** Chart color scheme */
  colorScheme?: string[];
  /** Show legend */
  showLegend?: boolean;
  /** Chart height (CSS value) */
  height?: string;
}

/**
 * Chart configurations for automobile statistics.
 *
 * Defines how AutoStatistics data is visualized in chart components.
 * This configuration will be used by the generic chart component framework (F8).
 *
 * NOTE: Domain-specific configuration - uses automobile statistics.
 */
export const AUTO_CHART_CONFIGS: ChartConfig<AutoStatistics>[] = [
  {
    id: 'manufacturer-dist',
    title: 'Distribution by Manufacturer',
    type: 'bar',
    dataSelector: (stats) => stats.manufacturerDistribution,
    xField: 'label',
    yField: 'count',
    showLegend: false,
    height: '400px'
  },
  {
    id: 'model-dist',
    title: 'Distribution by Model',
    type: 'bar',
    dataSelector: (stats) => stats.modelDistribution,
    xField: 'label',
    yField: 'count',
    showLegend: false,
    height: '400px'
  },
  {
    id: 'year-dist',
    title: 'Distribution by Year',
    type: 'bar',
    dataSelector: (stats) => stats.yearDistribution,
    xField: 'label',
    yField: 'count',
    showLegend: false,
    height: '400px'
  },
  {
    id: 'bodyclass-dist',
    title: 'Distribution by Body Class',
    type: 'pie',
    dataSelector: (stats) => stats.bodyClassDistribution,
    labelField: 'label',
    valueField: 'count',
    showLegend: true,
    height: '400px'
  },
  {
    id: 'datasource-dist',
    title: 'Distribution by Data Source',
    type: 'doughnut',
    dataSelector: (stats) => stats.dataSourceDistribution || [],
    labelField: 'label',
    valueField: 'count',
    showLegend: true,
    height: '350px'
  }
];
