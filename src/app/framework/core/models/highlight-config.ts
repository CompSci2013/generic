/**
 * Function type for evaluating whether data should be highlighted.
 *
 * @template TData - The type of data being evaluated
 * @template TFilters - The type of filters that control highlighting
 * @param data - The data item to evaluate
 * @param filters - Current highlight filter values
 * @returns True if the data should be highlighted
 */
export type HighlightPredicate<TData, TFilters> = (data: TData, filters: Partial<TFilters>) => boolean;

/**
 * Represents a single highlight rule configuration.
 *
 * @template TData - The type of data being highlighted
 * @template TFilters - The type of filters that control highlighting
 */
export interface HighlightRule<TData, TFilters> {
  /** Unique identifier for this highlight rule */
  id: string;

  /** Human-readable label for this rule */
  label: string;

  /** CSS class(es) to apply when the rule matches (space-separated string) */
  cssClass: string;

  /** Predicate function to determine if this rule applies to a data item */
  predicate: HighlightPredicate<TData, TFilters>;

  /** Priority for conflict resolution (higher priority wins). Default: 0 */
  priority?: number;

  /** Whether this rule is currently enabled. Default: true */
  enabled?: boolean;

  /** Optional description of what this rule highlights */
  description?: string;
}

/**
 * Configuration for the highlight system.
 *
 * @template TData - The type of data being highlighted
 * @template TFilters - The type of filters that control highlighting
 */
export interface HighlightConfig<TData, TFilters> {
  /** Array of highlight rules to apply */
  rules: HighlightRule<TData, TFilters>[];

  /** Whether highlighting is globally enabled. Default: true */
  enabled?: boolean;

  /** URL parameter name for storing highlight state. Default: 'highlight' */
  urlParamName?: string;

  /** Default CSS class for highlighted items (if no rules match). Optional */
  defaultCssClass?: string;
}

/**
 * Represents the current state of highlighting, including active filters.
 *
 * @template TFilters - The type of filters that control highlighting
 */
export interface HighlightState<TFilters> {
  /** Current highlight filter values */
  filters: Partial<TFilters>;

  /** Whether highlighting is currently active */
  enabled: boolean;

  /** IDs of enabled rules (for selective rule activation) */
  enabledRules?: string[];
}

/**
 * Result of evaluating highlight rules against a data item.
 */
export interface HighlightResult {
  /** Whether the item should be highlighted */
  shouldHighlight: boolean;

  /** CSS classes to apply (space-separated string) */
  cssClasses: string;

  /** IDs of rules that matched */
  matchedRules: string[];
}
