import { Type, TemplateRef } from '@angular/core';

/**
 * Configuration for a single panel in the panel container system
 *
 * This is a generic, domain-agnostic interface that defines how panels
 * should be configured and displayed.
 *
 * Usage:
 * ```typescript
 * const myPanel: PanelConfig = {
 *   id: 'data-table-panel',
 *   title: 'Data Results',
 *   component: ResultsTableComponent,
 *   collapsible: true,
 *   collapsed: false,
 *   popOutEnabled: true,
 *   order: 1
 * };
 * ```
 */
export interface PanelConfig {
  /**
   * Unique identifier for the panel
   * Used for state persistence and drag-drop operations
   */
  id: string;

  /**
   * Display title shown in the panel header
   */
  title: string;

  /**
   * Optional subtitle or description
   */
  subtitle?: string;

  /**
   * Component to render inside the panel
   * Must be provided unless using contentTemplate
   */
  component?: Type<any>;

  /**
   * Optional template reference for inline content
   * Alternative to using a component
   */
  contentTemplate?: TemplateRef<any>;

  /**
   * Whether the panel can be collapsed/expanded
   * @default false
   */
  collapsible?: boolean;

  /**
   * Initial collapsed state
   * Only applies if collapsible is true
   * @default false
   */
  collapsed?: boolean;

  /**
   * Whether the panel can be popped out into a separate window
   * @default false
   */
  popOutEnabled?: boolean;

  /**
   * Display order of the panel
   * Used for initial ordering and as fallback when drag-drop state is reset
   * @default 0
   */
  order?: number;

  /**
   * Whether the panel is visible
   * Hidden panels are not rendered
   * @default true
   */
  visible?: boolean;

  /**
   * Optional CSS class(es) to apply to the panel container
   */
  cssClass?: string;

  /**
   * Optional icon to display in panel header (PrimeIcons class name)
   * Example: 'pi pi-table', 'pi pi-chart-bar'
   */
  icon?: string;

  /**
   * Optional data/context to pass to the component
   * Available via injection or input binding
   */
  data?: any;

  /**
   * Whether the panel can be dragged to reorder
   * @default true
   */
  draggable?: boolean;

  /**
   * Minimum height for the panel in pixels
   */
  minHeight?: number;

  /**
   * Maximum height for the panel in pixels
   */
  maxHeight?: number;
}

/**
 * State of a panel that needs to be persisted
 * Used by StatePersistenceService to save/restore panel states
 */
export interface PanelState {
  /**
   * Panel identifier
   */
  id: string;

  /**
   * Current order/position in the container
   */
  order: number;

  /**
   * Whether the panel is currently collapsed
   */
  collapsed: boolean;

  /**
   * Whether the panel is currently visible
   */
  visible: boolean;
}

/**
 * Configuration for the panel container
 */
export interface PanelContainerConfig {
  /**
   * Unique identifier for this panel container instance
   * Used for persisting panel states
   */
  containerId: string;

  /**
   * Whether to persist panel order and state to localStorage
   * @default true
   */
  persistState?: boolean;

  /**
   * Whether to enable drag-drop reordering
   * @default true
   */
  enableDragDrop?: boolean;

  /**
   * Orientation of panels
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal';

  /**
   * Gap between panels in pixels
   * @default 16
   */
  gap?: number;

  /**
   * Animation duration in milliseconds for collapse/expand
   * @default 200
   */
  animationDuration?: number;
}
