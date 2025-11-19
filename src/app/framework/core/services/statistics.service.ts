import { Injectable } from '@angular/core';
import {
  AggregationConfig,
  AggregationResult,
  AggregatedDataPoint,
  HistogramConfig,
  HistogramData,
  HistogramBin,
  ChartData,
  ChartDataset,
  ChartDataPoint,
  StatisticalSummary,
  AggregateFunction
} from '../models/statistics';

/**
 * Generic Statistics Service
 *
 * Domain-agnostic statistical analysis and data aggregation service.
 * Works with any data type through TypeScript generics.
 *
 * Features:
 * - Data aggregation (count, sum, avg, min, max)
 * - Histogram generation
 * - Chart data transformation
 * - Statistical summaries
 *
 * @example
 * ```typescript
 * // Aggregate vehicle data by manufacturer
 * const result = statisticsService.aggregate(
 *   vehicles,
 *   { groupByField: 'manufacturer', aggregateFunction: 'count' }
 * );
 *
 * // Create histogram of prices
 * const histogram = statisticsService.prepareHistogramData(
 *   products,
 *   { field: 'price', bins: 10 }
 * );
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  constructor() {}

  /**
   * Aggregate data by a field with various aggregation functions
   *
   * @template TData - The type of data to aggregate
   * @param data - Array of data items
   * @param config - Aggregation configuration
   * @returns Aggregation result with grouped data
   */
  aggregate<TData>(
    data: TData[],
    config: AggregationConfig<TData>
  ): AggregationResult {
    // Apply filter if provided
    const filteredData = config.filter ? data.filter(config.filter) : data;

    // Extract the aggregation function
    const aggregateFunction = config.aggregateFunction || 'count';

    // Group data
    const groups = this.groupBy(filteredData, config.groupByField);

    // Calculate aggregated values for each group
    const aggregatedData: AggregatedDataPoint[] = [];

    for (const [groupKey, items] of groups.entries()) {
      const value = this.calculateAggregateValue(
        items,
        aggregateFunction,
        config.aggregateField
      );

      const dataPoint: AggregatedDataPoint = {
        groupKey,
        value,
        count: items.length
      };

      if (config.includeMetadata) {
        dataPoint.metadata = this.extractGroupMetadata(items);
      }

      aggregatedData.push(dataPoint);
    }

    // Sort results
    this.sortAggregatedData(
      aggregatedData,
      config.sortBy || 'value',
      config.sortDirection || 'desc'
    );

    // Apply limit if specified
    const limitedData = config.limit
      ? aggregatedData.slice(0, config.limit)
      : aggregatedData;

    // Calculate totals
    const totalCount = filteredData.length;
    const totalValue = limitedData.reduce((sum, point) => sum + point.value, 0);

    return {
      data: limitedData,
      totalCount,
      totalValue,
      groupByField: String(config.groupByField),
      aggregateField: config.aggregateField
        ? String(config.aggregateField)
        : undefined,
      aggregateFunction
    };
  }

  /**
   * Prepare histogram data from numeric field
   *
   * @template TData - The type of data
   * @param data - Array of data items
   * @param config - Histogram configuration
   * @returns Histogram data structure
   */
  prepareHistogramData<TData>(
    data: TData[],
    config: HistogramConfig<TData>
  ): HistogramData {
    // Apply filter if provided
    const filteredData = config.filter ? data.filter(config.filter) : data;

    // Extract values
    const values = this.extractNumericValues(filteredData, config.field);

    if (values.length === 0) {
      return this.createEmptyHistogram(String(config.field));
    }

    // Calculate statistics
    const stats = this.calculateStatistics(values);

    // Determine bin edges
    const binEdges = config.binEdges
      ? config.binEdges
      : this.calculateBinEdges(
          config.minValue ?? stats.min,
          config.maxValue ?? stats.max,
          config.bins || 10
        );

    // Create bins
    const bins = this.createHistogramBins(
      filteredData,
      values,
      binEdges,
      config.includeItems || false
    );

    return {
      bins,
      totalCount: values.length,
      min: stats.min,
      max: stats.max,
      average: stats.average,
      median: stats.median,
      field: String(config.field)
    };
  }

  /**
   * Convert aggregation result to chart data
   *
   * @param aggregationResult - Aggregation result from aggregate()
   * @param chartType - Type of chart
   * @returns Chart data structure
   */
  aggregationToChartData(
    aggregationResult: AggregationResult,
    chartType: 'bar' | 'line' | 'pie' = 'bar'
  ): ChartData {
    const dataPoints: ChartDataPoint[] = aggregationResult.data.map(point => ({
      x: point.groupKey,
      y: point.value,
      label: String(point.groupKey),
      metadata: point.metadata
    }));

    const dataset: ChartDataset = {
      label: aggregationResult.groupByField,
      data: dataPoints,
      type: chartType
    };

    return {
      datasets: [dataset],
      title: `${aggregationResult.aggregateFunction} by ${aggregationResult.groupByField}`,
      xAxisLabel: aggregationResult.groupByField,
      yAxisLabel: aggregationResult.aggregateFunction
    };
  }

  /**
   * Convert histogram data to chart data
   *
   * @param histogramData - Histogram data from prepareHistogramData()
   * @returns Chart data structure
   */
  histogramToChartData(histogramData: HistogramData): ChartData {
    const dataPoints: ChartDataPoint[] = histogramData.bins.map(bin => ({
      x: bin.label,
      y: bin.count,
      label: bin.label,
      metadata: {
        min: bin.min,
        max: bin.max,
        percentage: bin.percentage
      }
    }));

    const dataset: ChartDataset = {
      label: histogramData.field,
      data: dataPoints,
      type: 'bar'
    };

    return {
      datasets: [dataset],
      title: `Distribution of ${histogramData.field}`,
      xAxisLabel: histogramData.field,
      yAxisLabel: 'Count'
    };
  }

  /**
   * Calculate statistical summary for a numeric field
   *
   * @template TData - The type of data
   * @param data - Array of data items
   * @param field - Field to analyze
   * @returns Statistical summary
   */
  calculateSummary<TData>(
    data: TData[],
    field: keyof TData
  ): StatisticalSummary {
    const values = this.extractNumericValues(data, field);
    return this.calculateStatistics(values);
  }

  /**
   * Group data by a field
   * @private
   */
  private groupBy<TData>(
    data: TData[],
    field: keyof TData
  ): Map<string | number, TData[]> {
    const groups = new Map<string | number, TData[]>();

    for (const item of data) {
      const key = item[field] as unknown as string | number;
      const normalizedKey = key ?? 'N/A';

      if (!groups.has(normalizedKey)) {
        groups.set(normalizedKey, []);
      }
      groups.get(normalizedKey)!.push(item);
    }

    return groups;
  }

  /**
   * Calculate aggregate value for a group
   * @private
   */
  private calculateAggregateValue<TData>(
    items: TData[],
    aggregateFunction: AggregateFunction,
    aggregateField?: keyof TData
  ): number {
    if (aggregateFunction === 'count') {
      return items.length;
    }

    if (!aggregateField) {
      throw new Error(
        `aggregateField is required for ${aggregateFunction} function`
      );
    }

    const values = this.extractNumericValues(items, aggregateField);

    switch (aggregateFunction) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);

      case 'avg':
        return values.length > 0
          ? values.reduce((sum, val) => sum + val, 0) / values.length
          : 0;

      case 'min':
        return values.length > 0 ? Math.min(...values) : 0;

      case 'max':
        return values.length > 0 ? Math.max(...values) : 0;

      default:
        return items.length;
    }
  }

  /**
   * Extract numeric values from a field
   * @private
   */
  private extractNumericValues<TData>(
    data: TData[],
    field: keyof TData
  ): number[] {
    return data
      .map(item => {
        const value = item[field];
        const numValue = typeof value === 'number' ? value : Number(value);
        return isNaN(numValue) ? null : numValue;
      })
      .filter((val): val is number => val !== null);
  }

  /**
   * Calculate statistical metrics
   * @private
   */
  private calculateStatistics(values: number[]): StatisticalSummary {
    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        stdDev: 0,
        variance: 0
      };
    }

    const count = values.length;
    const sum = values.reduce((s, v) => s + v, 0);
    const average = sum / count;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate median
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];

    // Calculate variance and standard deviation
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      count,
      sum,
      average,
      min,
      max,
      median,
      stdDev,
      variance
    };
  }

  /**
   * Calculate bin edges for histogram
   * @private
   */
  private calculateBinEdges(
    min: number,
    max: number,
    numBins: number
  ): number[] {
    const binWidth = (max - min) / numBins;
    const edges: number[] = [];

    for (let i = 0; i <= numBins; i++) {
      edges.push(min + i * binWidth);
    }

    return edges;
  }

  /**
   * Create histogram bins
   * @private
   */
  private createHistogramBins<TData>(
    data: TData[],
    values: number[],
    binEdges: number[],
    includeItems: boolean
  ): HistogramBin[] {
    const bins: HistogramBin[] = [];
    const totalCount = values.length;

    for (let i = 0; i < binEdges.length - 1; i++) {
      const min = binEdges[i];
      const max = binEdges[i + 1];
      const isLastBin = i === binEdges.length - 2;

      // Count items in this bin
      const itemsInBin: { value: number; item: TData }[] = [];
      values.forEach((value, idx) => {
        const inBin = isLastBin
          ? value >= min && value <= max
          : value >= min && value < max;

        if (inBin) {
          itemsInBin.push({ value, item: data[idx] });
        }
      });

      const count = itemsInBin.length;
      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

      const bin: HistogramBin = {
        min,
        max,
        count,
        percentage,
        label: this.formatBinLabel(min, max)
      };

      if (includeItems) {
        bin.items = itemsInBin.map(item => item.item);
      }

      bins.push(bin);
    }

    return bins;
  }

  /**
   * Format bin label
   * @private
   */
  private formatBinLabel(min: number, max: number): string {
    const formatNum = (n: number): string => {
      return Number.isInteger(n) ? n.toString() : n.toFixed(2);
    };

    return `${formatNum(min)}-${formatNum(max)}`;
  }

  /**
   * Create empty histogram
   * @private
   */
  private createEmptyHistogram(field: string): HistogramData {
    return {
      bins: [],
      totalCount: 0,
      min: 0,
      max: 0,
      average: 0,
      median: 0,
      field
    };
  }

  /**
   * Extract metadata from group items
   * @private
   */
  private extractGroupMetadata<TData>(items: TData[]): Record<string, any> {
    return {
      sampleItem: items[0],
      itemCount: items.length
    };
  }

  /**
   * Sort aggregated data
   * @private
   */
  private sortAggregatedData(
    data: AggregatedDataPoint[],
    sortBy: 'key' | 'value',
    direction: 'asc' | 'desc'
  ): void {
    data.sort((a, b) => {
      const compareValue =
        sortBy === 'key'
          ? String(a.groupKey).localeCompare(String(b.groupKey))
          : a.value - b.value;

      return direction === 'asc' ? compareValue : -compareValue;
    });
  }
}
