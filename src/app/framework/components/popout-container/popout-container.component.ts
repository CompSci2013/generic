import { Component, Input, TemplateRef, OnInit } from '@angular/core';
import { PopoutContextService } from '../../core/services/popout-context.service';
import { PopOutContext } from '../../core/models/popout-config';
import { Observable } from 'rxjs';

/**
 * Container component for pop-out window content.
 *
 * This component:
 * - Renders content templates in pop-out windows
 * - Provides context about the window (parent vs pop-out)
 * - Applies pop-out-specific styling
 * - Integrates with PopOutContextService for communication
 *
 * @example
 * ```html
 * <!-- In parent window -->
 * <button (click)="openPopOut()">Open in New Window</button>
 *
 * <!-- In pop-out route -->
 * <app-popout-container [contentTemplate]="mainContent">
 * </app-popout-container>
 *
 * <ng-template #mainContent>
 *   <app-base-table [data]="data$ | async"></app-base-table>
 * </ng-template>
 * ```
 */
@Component({
  selector: 'app-popout-container',
  templateUrl: './popout-container.component.html',
  styleUrls: ['./popout-container.component.scss']
})
export class PopoutContainerComponent implements OnInit {
  /**
   * Template to render inside the pop-out container.
   */
  @Input() contentTemplate?: TemplateRef<any>;

  /**
   * Optional title to display (overrides default).
   */
  @Input() title?: string;

  /**
   * Observable of the current window context.
   */
  context$: Observable<PopOutContext>;

  /**
   * Current window context (sync).
   */
  context: PopOutContext;

  constructor(private popOutService: PopoutContextService) {
    this.context$ = this.popOutService.context$;
    this.context = this.popOutService.getContext();
  }

  ngOnInit(): void {
    // Subscribe to context updates
    this.context$.subscribe(ctx => {
      this.context = ctx;

      // Update document title if in pop-out
      if (ctx.isPopOut && this.title) {
        document.title = this.title;
      }
    });
  }

  /**
   * Closes this pop-out window (only works if this is a pop-out).
   */
  closeWindow(): void {
    if (this.context.isPopOut) {
      window.close();
    }
  }

  /**
   * Checks if this is a pop-out window.
   *
   * @returns True if pop-out
   */
  isPopOut(): boolean {
    return this.context.isPopOut;
  }
}
