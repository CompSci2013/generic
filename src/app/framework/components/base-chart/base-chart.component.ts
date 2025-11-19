import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { ChartConfig, ChartSeries, ChartClickEvent } from './models/chart-config';

/**
 * Generic base chart component using Plotly.js
 * Works with any data type through configuration
 *
 * Features:
 * - Multiple chart types (bar, histogram, pie, line, scatter, area)
 * - Interactive click-to-filter
 * - Responsive design
 * - Custom styling
 * - Loading states
 * - Generic data binding
 *
 * @template TData - The type of data points in the chart
 *
 * @example
 * ```typescript
 * interface SalesData {
 *   month: string;
 *   sales: number;
 * }
 *
 * config: ChartConfig<SalesData> = {
 *   id: 'sales-chart',
 *   type: 'bar',
 *   title: 'Monthly Sales',
 *   series: {
 *     data: salesData,
 *     xField: 'month',
 *     yField: 'sales'
 *   }
 * };
 *
 * <app-base-chart
 *   [config]="config"
 *   (dataPointClick)="onChartClick($event)">
 * </app-base-chart>
 * ```
 */
@Component({
  selector: 'app-base-chart',
  templateUrl: './base-chart.component.html',
  styleUrls: ['./base-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseChartComponent<TData = any>
  implements OnChanges, AfterViewInit, OnDestroy
{
  /**
   * Chart configuration
   */
  @Input() config!: ChartConfig<TData>;

  /**
   * Loading state
   */
  @Input() loading = false;

  /**
   * Emitted when a data point is clicked
   */
  @Output() dataPointClick = new EventEmitter<ChartClickEvent<TData>>();

  /**
   * Reference to the chart container
   */
  @ViewChild('chartContainer', { static: false }) chartContainer?: ElementRef;

  /**
   * Plotly chart instance
   */
  private plotlyChart: any;

  /**
   * Whether chart has been initialized
   */
  private initialized = false;

  ngAfterViewInit(): void {
    if (this.config && !this.loading) {
      this.renderChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange && this.initialized) {
      this.renderChart();
    }

    if (changes['loading'] && !this.loading && this.config && !this.initialized) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.plotlyChart && this.chartContainer) {
      Plotly.purge(this.chartContainer.nativeElement);
    }
  }

  /**
   * Render the chart using Plotly.js
   */
  private renderChart(): void {
    if (!this.chartContainer || !this.config) {
      return;
    }

    const element = this.chartContainer.nativeElement;
    const series = Array.isArray(this.config.series)
      ? this.config.series
      : [this.config.series];

    // Prepare Plotly data traces
    const traces = series.map((s, index) => this.createTrace(s, index));

    // Prepare Plotly layout
    const layout = this.createLayout();

    // Prepare Plotly config
    const config = this.createPlotlyConfig();

    // Render chart
    Plotly.newPlot(element, traces, layout, config).then(() => {
      this.initialized = true;
      this.attachClickHandler(element, series);
    });
  }

  /**
   * Create a Plotly trace from a chart series
   */
  private createTrace(series: ChartSeries<TData>, index: number): any {
    const xData = series.data.map((d) => (d as any)[series.xField]);
    const yData = series.data.map((d) => (d as any)[series.yField]);

    const trace: any = {
      x: xData,
      y: yData,
      name: series.name || `Series ${index + 1}`,
      type: this.getPlotlyType(series.type || this.config.type),
    };

    // Add color if specified
    if (series.color) {
      trace.marker = { color: series.color };
    }

    // Add hover template if specified
    if (series.hoverTemplate) {
      trace.hovertemplate = series.hoverTemplate;
    }

    // Chart-specific configurations
    switch (this.config.type) {
      case 'histogram':
        trace.type = 'histogram';
        trace.x = xData;
        delete trace.y;
        break;
      case 'pie':
        trace.labels = xData;
        trace.values = yData;
        delete trace.x;
        delete trace.y;
        break;
      case 'area':
        trace.fill = 'tozeroy';
        break;
    }

    return trace;
  }

  /**
   * Create Plotly layout object
   */
  private createLayout(): any {
    // Use custom plotly layout if provided
    if (this.config.plotlyLayout) {
      return this.config.plotlyLayout;
    }

    const layout: any = {
      title: this.config.layout?.title || this.config.title,
      showlegend: this.config.layout?.showLegend !== false,
      autosize: true,
    };

    // Add axis titles
    if (this.config.layout?.xAxisTitle) {
      layout.xaxis = { title: this.config.layout.xAxisTitle };
    }

    if (this.config.layout?.yAxisTitle) {
      layout.yaxis = { title: this.config.layout.yAxisTitle };
    }

    // Add dimensions
    if (this.config.layout?.width) {
      layout.width = this.config.layout.width;
    }

    if (this.config.layout?.height) {
      layout.height = this.config.layout.height;
    }

    // Add margin
    if (this.config.layout?.margin) {
      layout.margin = this.config.layout.margin;
    }

    // Add background color
    if (this.config.layout?.backgroundColor) {
      layout.paper_bgcolor = this.config.layout.backgroundColor;
      layout.plot_bgcolor = this.config.layout.backgroundColor;
    }

    // Add font family
    if (this.config.layout?.fontFamily) {
      layout.font = { family: this.config.layout.fontFamily };
    }

    // Responsive configuration
    layout.autosize = true;

    return layout;
  }

  /**
   * Create Plotly configuration object
   */
  private createPlotlyConfig(): any {
    // Use custom plotly config if provided
    if (this.config.plotlyConfig) {
      return this.config.plotlyConfig;
    }

    return {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };
  }

  /**
   * Attach click event handler
   */
  private attachClickHandler(element: HTMLElement, series: ChartSeries<TData>[]): void {
    if (!this.config.interactive && !this.config.clickToFilter) {
      return;
    }

    element.on('plotly_click', (data: any) => {
      if (!data.points || data.points.length === 0) {
        return;
      }

      const point = data.points[0];
      const seriesIndex = point.curveNumber || 0;
      const pointIndex = point.pointIndex;

      // Get the actual data point
      const actualData = series[seriesIndex]?.data[pointIndex];

      if (actualData) {
        const clickEvent: ChartClickEvent<TData> = {
          point: actualData,
          pointIndex,
          seriesIndex,
          event: data,
        };

        this.dataPointClick.emit(clickEvent);
      }
    });
  }

  /**
   * Map chart type to Plotly type
   */
  private getPlotlyType(type: string): string {
    const typeMap: Record<string, string> = {
      bar: 'bar',
      histogram: 'histogram',
      pie: 'pie',
      line: 'scatter',
      scatter: 'scatter',
      area: 'scatter',
    };

    return typeMap[type] || 'scatter';
  }

  /**
   * Get container style class
   */
  getStyleClass(): string {
    return this.config?.styleClass || '';
  }

  /**
   * Check if chart is loading
   */
  isLoading(): boolean {
    return this.loading || this.config?.loading === true;
  }
}
