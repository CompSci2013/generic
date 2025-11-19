/**
 * Automobile data model representing aggregated vehicle information.
 *
 * NOTE: Domain-specific naming is allowed in the domain-config layer.
 * This represents the main data rows returned by the automobile API.
 */
export interface AutoData {
  /** Unique identifier for this vehicle group */
  id: string;

  /** Manufacturer name (e.g., "Ford", "Toyota") */
  manufacturer: string;

  /** Model name (e.g., "F-150", "Camry") */
  model: string;

  /** Model year */
  year: number;

  /** Body class/type (e.g., "Sedan", "SUV", "Pickup Truck") */
  bodyClass: string;

  /** Number of VIN instances for this vehicle group */
  vinCount: number;

  /** Data source (e.g., "NHTSA", "CARFAX") */
  dataSource?: string;

  /** Optional additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Detailed VIN instance information.
 *
 * Represents individual vehicle instances with specific VINs.
 */
export interface VinInstance {
  /** Vehicle Identification Number */
  vin: string;

  /** Vehicle condition (e.g., "New", "Used", "Certified Pre-Owned") */
  condition: string;

  /** Odometer reading in miles */
  mileage: number;

  /** Physical location or dealership */
  location: string;

  /** State where vehicle is registered */
  registrationState: string;

  /** Optional price information */
  price?: number;

  /** Optional color */
  color?: string;

  /** Optional additional details */
  details?: Record<string, any>;
}

/**
 * API response wrapper for automobile data.
 */
export interface AutoDataResponse {
  /** Array of automobile data records */
  data: AutoData[];

  /** Total count of matching records (for pagination) */
  total: number;

  /** Current page number */
  page: number;

  /** Page size */
  size: number;

  /** Whether there are more pages */
  hasMore: boolean;
}
