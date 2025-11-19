import {
  Component,
  Input,
  OnInit,
  OnDestroy
} from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { PanelConfig, PanelState, PanelContainerConfig } from '../../core/models/panel-config';
import { StatePersistenceService } from '../../core/services/state-persistence.service';

/**
 * Generic Panel Container Component
 *
 * A domain-agnostic component that displays a collection of panels
 * with support for:
 * - Drag-and-drop reordering (Angular CDK)
 * - Collapse/expand panels
 * - Panel visibility toggling
 * - State persistence (order, collapsed state, visibility)
 * - Pop-out windows (via popout-container)
 *
 * This component is completely generic and works with any content type.
 * The actual content is provided via PanelConfig which can specify either
 * a component or a template.
 *
 * Usage:
 * ```html
 * <app-panel-container
 *   [panels]="panelConfigs"
 *   [containerId]="'discover-panels'"
 *   [enableDragDrop]="true"
 *   [persistState]="true">
 * </app-panel-container>
 * ```
 */
@Component({
  selector: 'app-panel-container',
  templateUrl: './panel-container.component.html',
  styleUrls: ['./panel-container.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: '0', opacity: 0 }))
      ])
    ])
  ]
})
export class PanelContainerComponent implements OnInit, OnDestroy {
  /**
   * Array of panel configurations to display
   */
  @Input() panels: PanelConfig[] = [];

  /**
   * Configuration for the container
   */
  @Input() config: PanelContainerConfig = {
    containerId: 'default-panel-container',
    persistState: true,
    enableDragDrop: true,
    orientation: 'vertical',
    gap: 16,
    animationDuration: 200
  };

  /**
   * Shorthand for container ID (deprecated - use config.containerId instead)
   */
  @Input() set containerId(value: string) {
    this.config.containerId = value;
  }

  /**
   * Shorthand for persist state (deprecated - use config.persistState instead)
   */
  @Input() set persistState(value: boolean) {
    this.config.persistState = value;
  }

  /**
   * Shorthand for enable drag-drop (deprecated - use config.enableDragDrop instead)
   */
  @Input() set enableDragDrop(value: boolean) {
    this.config.enableDragDrop = value;
  }

  /**
   * Internal array of panels with runtime state
   * This is what we actually render
   */
  panelsWithState: PanelConfig[] = [];

  /**
   * Cleanup subscription
   */
  private destroy$ = new Subject<void>();

  /**
   * Storage key for persisting panel state
   */
  private get storageKey(): string {
    return `panel-container-${this.config.containerId}`;
  }

  constructor(
    private statePersistence: StatePersistenceService
  ) {}

  ngOnInit(): void {
    this.initializePanels();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize panels with persisted state if available
   */
  private initializePanels(): void {
    // Start with input panels
    this.panelsWithState = [...this.panels];

    // Apply defaults for optional properties
    this.panelsWithState.forEach(panel => {
      panel.collapsible = panel.collapsible ?? false;
      panel.collapsed = panel.collapsed ?? false;
      panel.visible = panel.visible ?? true;
      panel.order = panel.order ?? 0;
      panel.draggable = panel.draggable ?? true;
      panel.popOutEnabled = panel.popOutEnabled ?? false;
    });

    // Load and apply persisted state
    if (this.config.persistState) {
      this.loadPersistedState();
    }

    // Sort by order
    this.sortPanelsByOrder();
  }

  /**
   * Load persisted panel state from localStorage
   */
  private loadPersistedState(): void {
    const persistedStates = this.statePersistence.load<PanelState[]>(this.storageKey);

    if (!persistedStates || !Array.isArray(persistedStates)) {
      return;
    }

    // Apply persisted state to panels
    persistedStates.forEach(persistedState => {
      const panel = this.panelsWithState.find(p => p.id === persistedState.id);
      if (panel) {
        panel.order = persistedState.order;
        panel.collapsed = persistedState.collapsed;
        panel.visible = persistedState.visible;
      }
    });
  }

  /**
   * Save current panel state to localStorage
   */
  private saveState(): void {
    if (!this.config.persistState) {
      return;
    }

    const states: PanelState[] = this.panelsWithState.map(panel => ({
      id: panel.id,
      order: panel.order ?? 0,
      collapsed: panel.collapsed ?? false,
      visible: panel.visible ?? true
    }));

    this.statePersistence.save(this.storageKey, states);
  }

  /**
   * Sort panels by their order property
   */
  private sortPanelsByOrder(): void {
    this.panelsWithState.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /**
   * Handle drag-drop reorder event
   */
  onDrop(event: CdkDragDrop<PanelConfig[]>): void {
    if (!this.config.enableDragDrop) {
      return;
    }

    // Reorder the array
    moveItemInArray(this.panelsWithState, event.previousIndex, event.currentIndex);

    // Update order values
    this.panelsWithState.forEach((panel, index) => {
      panel.order = index;
    });

    // Persist the new order
    this.saveState();
  }

  /**
   * Toggle panel collapsed state
   */
  toggleCollapse(panel: PanelConfig): void {
    if (!panel.collapsible) {
      return;
    }

    panel.collapsed = !panel.collapsed;
    this.saveState();
  }

  /**
   * Toggle panel visibility
   */
  toggleVisibility(panel: PanelConfig): void {
    panel.visible = !panel.visible;
    this.saveState();
  }

  /**
   * Reset panel order to default configuration
   */
  resetPanelOrder(): void {
    // Reset to original panel configuration order
    this.panels.forEach((originalPanel, index) => {
      const panel = this.panelsWithState.find(p => p.id === originalPanel.id);
      if (panel) {
        panel.order = originalPanel.order ?? index;
        panel.collapsed = originalPanel.collapsed ?? false;
        panel.visible = originalPanel.visible ?? true;
      }
    });

    this.sortPanelsByOrder();
    this.saveState();
  }

  /**
   * Clear persisted state from storage
   */
  clearPersistedState(): void {
    this.statePersistence.clear(this.storageKey);
    this.initializePanels();
  }

  /**
   * Get visible panels only
   */
  get visiblePanels(): PanelConfig[] {
    return this.panelsWithState.filter(p => p.visible !== false);
  }

  /**
   * Get drag-drop CDK list ID
   */
  get cdkDropListId(): string {
    return `panel-container-${this.config.containerId}`;
  }

  /**
   * Check if a panel can be dragged
   */
  canDrag(panel: PanelConfig): boolean {
    return this.config.enableDragDrop !== false && panel.draggable !== false;
  }

  /**
   * Get container orientation class
   */
  get orientationClass(): string {
    return `orientation-${this.config.orientation || 'vertical'}`;
  }

  /**
   * Get container gap style
   */
  get containerGap(): string {
    return `${this.config.gap || 16}px`;
  }

  /**
   * TrackBy function for *ngFor optimization
   */
  trackPanel(_index: number, panel: PanelConfig): string {
    return panel.id;
  }
}
