/**
 * Supported chart types
 */
export type ChartType = 'bar' | 'histogram' | 'pie' | 'line' | 'scatter' | 'area';

/**
 * Chart layout configuration
 */
export interface ChartLayout {
  /**
   * Chart title
   */
  title?: string;

  /**
   * X-axis title
   */
  xAxisTitle?: string;

  /**
   * Y-axis title
   */
  yAxisTitle?: string;

  /**
   * Chart width
   */
  width?: number;

  /**
   * Chart height
   */
  height?: number;

  /**
   * Whether to show legend
   * @default true
   */
  showLegend?: boolean;

  /**
   * Background color
   */
  backgroundColor?: string;

  /**
   * Font family
   */
  fontFamily?: string;

  /**
   * Margin configuration
   */
  margin?: {
    l?: number;
    r?: number;
    t?: number;
    b?: number;
  };
}

/**
 * Chart data series configuration
 */
export interface ChartSeries<TData = any> {
  /**
   * Series name (for legend)
   */
  name?: string;

  /**
   * Data for this series
   */
  data: TData[];

  /**
   * Field to use for X values
   */
  xField: keyof TData | string;

  /**
   * Field to use for Y values
   */
  yField: keyof TData | string;

  /**
   * Series color
   */
  color?: string;

  /**
   * Series type (can override chart type for mixed charts)
   */
  type?: ChartType;

  /**
   * Custom formatter for hover labels
   */
  hoverTemplate?: string;
}

/**
 * Configuration for a generic chart component
 * Works with any data type through Plotly.js
 */
export interface ChartConfig<TData = any> {
  /**
   * Unique identifier for the chart
   */
  id: string;

  /**
   * Chart type
   */
  type: ChartType;

  /**
   * Chart title
   */
  title: string;

  /**
   * Data series for the chart
   * Can be single series or multiple for comparison
   */
  series: ChartSeries<TData> | ChartSeries<TData>[];

  /**
   * Layout configuration
   */
  layout?: ChartLayout;

  /**
   * Whether chart is interactive (clickable)
   * @default true
   */
  interactive?: boolean;

  /**
   * Whether to enable click-to-filter
   * @default false
   */
  clickToFilter?: boolean;

  /**
   * Custom Plotly.js configuration
   * Allows full control over Plotly settings
   */
  plotlyConfig?: any;

  /**
   * Custom Plotly.js layout
   * Overrides layout settings if provided
   */
  plotlyLayout?: any;

  /**
   * CSS class for the chart container
   */
  styleClass?: string;

  /**
   * Whether to show loading indicator
   * @default false
   */
  loading?: boolean;
}

/**
 * Event emitted when a data point is clicked
 */
export interface ChartClickEvent<TData = any> {
  /**
   * The data point that was clicked
   */
  point: TData;

  /**
   * Index of the point in the series
   */
  pointIndex: number;

  /**
   * Series index (for multi-series charts)
   */
  seriesIndex: number;

  /**
   * Original Plotly event
   */
  event: any;
}
