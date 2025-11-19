/**
 * Automobile-specific search filters.
 *
 * NOTE: Domain-specific naming is allowed in the domain-config layer.
 * This interface defines all filter parameters for automobile searches.
 */
export interface AutoSearchFilters {
  /** Selected manufacturers (e.g., ["Ford", "Toyota"]) */
  manufacturers?: string[];

  /** Selected models (e.g., ["F-150", "Camry"]) */
  models?: string[];

  /** Minimum year filter */
  yearMin?: number;

  /** Maximum year filter */
  yearMax?: number;

  /** Selected body classes (e.g., ["Sedan", "SUV"]) */
  bodyClass?: string[];

  /** Selected data sources (e.g., ["NHTSA", "CARFAX"]) */
  dataSource?: string[];

  /** VIN search (exact matches) */
  vins?: string[];

  /** Current page number (1-indexed) */
  page: number;

  /** Page size (number of results per page) */
  size: number;

  /** Field to sort by (e.g., "manufacturer", "year") */
  sortField?: string;

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Default filter values for automobile searches.
 */
export const DEFAULT_AUTO_FILTERS: AutoSearchFilters = {
  manufacturers: [],
  models: [],
  bodyClass: [],
  dataSource: [],
  vins: [],
  page: 1,
  size: 50,
  sortField: 'manufacturer',
  sortOrder: 'asc'
};
