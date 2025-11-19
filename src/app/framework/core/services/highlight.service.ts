import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  HighlightConfig,
  HighlightState,
  HighlightResult,
  HighlightRule
} from '../models/highlight-config';

/**
 * Generic service for managing data highlighting based on configurable rules.
 *
 * This service provides:
 * - Rule-based highlighting with priority resolution
 * - State management for highlight filters
 * - Integration with URL state management (via UrlStateService)
 * - Reactive updates via RxJS observables
 *
 * @template TData - The type of data being highlighted
 * @template TFilters - The type of filters that control highlighting
 *
 * @example
 * ```typescript
 * // Configure highlighting
 * const config: HighlightConfig<Product, ProductFilters> = {
 *   rules: [
 *     {
 *       id: 'low-stock',
 *       label: 'Low Stock',
 *       cssClass: 'highlight-warning',
 *       predicate: (product) => product.stock < 10,
 *       priority: 10
 *     },
 *     {
 *       id: 'out-of-stock',
 *       label: 'Out of Stock',
 *       cssClass: 'highlight-danger',
 *       predicate: (product) => product.stock === 0,
 *       priority: 20
 *     }
 *   ]
 * };
 *
 * highlightService.setConfig(config);
 *
 * // Evaluate highlighting for a data item
 * const result = highlightService.evaluate(product);
 * console.log(result.cssClasses); // 'highlight-danger' (if out of stock)
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class HighlightService<TData = any, TFilters = any> {
  /**
   * Current highlight configuration.
   */
  private config: HighlightConfig<TData, TFilters> | null = null;

  /**
   * Internal state subject for reactive updates.
   */
  private stateSubject = new BehaviorSubject<HighlightState<TFilters>>({
    filters: {},
    enabled: true
  });

  /**
   * Observable stream of highlight state changes.
   */
  public state$: Observable<HighlightState<TFilters>> = this.stateSubject.asObservable();

  /**
   * Observable stream indicating whether highlighting is currently active.
   */
  public enabled$: Observable<boolean> = this.state$.pipe(
    map(state => state.enabled)
  );

  /**
   * Sets the highlight configuration.
   *
   * @param config - The highlight configuration to use
   */
  setConfig(config: HighlightConfig<TData, TFilters>): void {
    this.config = config;

    // Update enabled state from config
    if (config.enabled !== undefined) {
      this.updateState({
        ...this.stateSubject.value,
        enabled: config.enabled
      });
    }
  }

  /**
   * Gets the current highlight configuration.
   *
   * @returns The current configuration, or null if not set
   */
  getConfig(): HighlightConfig<TData, TFilters> | null {
    return this.config;
  }

  /**
   * Updates the highlight filter values.
   *
   * @param filters - Partial filter values to update
   */
  setFilters(filters: Partial<TFilters>): void {
    this.updateState({
      ...this.stateSubject.value,
      filters
    });
  }

  /**
   * Gets the current highlight filter values.
   *
   * @returns Current filter values
   */
  getFilters(): Partial<TFilters> {
    return this.stateSubject.value.filters;
  }

  /**
   * Enables or disables highlighting globally.
   *
   * @param enabled - Whether to enable highlighting
   */
  setEnabled(enabled: boolean): void {
    this.updateState({
      ...this.stateSubject.value,
      enabled
    });
  }

  /**
   * Checks if highlighting is currently enabled.
   *
   * @returns True if enabled
   */
  isEnabled(): boolean {
    return this.stateSubject.value.enabled;
  }

  /**
   * Enables or disables specific rules by ID.
   *
   * @param ruleIds - Array of rule IDs to enable/disable
   * @param enabled - Whether to enable or disable the rules
   */
  setRulesEnabled(ruleIds: string[], enabled: boolean): void {
    if (!this.config) {
      console.warn('HighlightService: No configuration set');
      return;
    }

    this.config.rules.forEach(rule => {
      if (ruleIds.includes(rule.id)) {
        rule.enabled = enabled;
      }
    });

    // Trigger state update to refresh highlights
    this.updateState({ ...this.stateSubject.value });
  }

  /**
   * Evaluates highlight rules against a data item.
   *
   * @param data - The data item to evaluate
   * @returns Highlight result with CSS classes and matched rules
   */
  evaluate(data: TData): HighlightResult {
    // Default result (no highlighting)
    const defaultResult: HighlightResult = {
      shouldHighlight: false,
      cssClasses: '',
      matchedRules: []
    };

    // If highlighting is disabled or no config, return default
    if (!this.isEnabled() || !this.config) {
      return defaultResult;
    }

    const currentFilters = this.getFilters();
    const matchedRules: Array<{ rule: HighlightRule<TData, TFilters>; priority: number }> = [];

    // Evaluate all enabled rules
    for (const rule of this.config.rules) {
      // Skip disabled rules
      if (rule.enabled === false) {
        continue;
      }

      // Check if rule predicate matches
      try {
        if (rule.predicate(data, currentFilters)) {
          matchedRules.push({
            rule,
            priority: rule.priority ?? 0
          });
        }
      } catch (error) {
        console.error(`HighlightService: Error evaluating rule '${rule.id}'`, error);
      }
    }

    // If no rules matched, return default or default CSS class
    if (matchedRules.length === 0) {
      return {
        shouldHighlight: !!this.config.defaultCssClass,
        cssClasses: this.config.defaultCssClass || '',
        matchedRules: []
      };
    }

    // Sort by priority (descending) and take the highest priority rule
    matchedRules.sort((a, b) => b.priority - a.priority);
    const highestPriorityRule = matchedRules[0].rule;

    return {
      shouldHighlight: true,
      cssClasses: highestPriorityRule.cssClass,
      matchedRules: matchedRules.map(mr => mr.rule.id)
    };
  }

  /**
   * Clears all highlight filters.
   */
  clearFilters(): void {
    this.setFilters({} as Partial<TFilters>);
  }

  /**
   * Resets the highlight service to its initial state.
   */
  reset(): void {
    this.config = null;
    this.stateSubject.next({
      filters: {},
      enabled: true
    });
  }

  /**
   * Gets all configured rules.
   *
   * @returns Array of highlight rules, or empty array if no config
   */
  getRules(): HighlightRule<TData, TFilters>[] {
    return this.config?.rules || [];
  }

  /**
   * Gets enabled rules only.
   *
   * @returns Array of enabled rules
   */
  getEnabledRules(): HighlightRule<TData, TFilters>[] {
    return this.getRules().filter(rule => rule.enabled !== false);
  }

  /**
   * Updates the internal state and notifies subscribers.
   *
   * @param state - New state
   */
  private updateState(state: HighlightState<TFilters>): void {
    this.stateSubject.next(state);
  }
}
