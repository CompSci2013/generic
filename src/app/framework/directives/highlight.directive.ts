import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HighlightService } from '../core/services/highlight.service';

/**
 * Directive for automatically applying highlight CSS classes to elements.
 *
 * This directive:
 * - Evaluates highlight rules via HighlightService
 * - Applies/removes CSS classes dynamically
 * - Reacts to changes in highlight state or data
 * - Can be applied to any DOM element (table rows, cards, etc.)
 *
 * @example
 * ```html
 * <!-- Apply to a table row -->
 * <tr *ngFor="let item of data" [appHighlight]="item">
 *   <td>{{ item.name }}</td>
 * </tr>
 *
 * <!-- Apply to a card -->
 * <div class="card" [appHighlight]="product">
 *   <h3>{{ product.title }}</h3>
 * </div>
 * ```
 */
@Directive({
  selector: '[appHighlight]',
  standalone: false
})
export class HighlightDirective<TData = any, TFilters = any> implements OnInit, OnDestroy, OnChanges {
  /**
   * The data item to evaluate for highlighting.
   */
  @Input('appHighlight') data!: TData;

  /**
   * Currently applied CSS classes (tracked for removal).
   */
  private appliedClasses: string[] = [];

  /**
   * Subject for managing subscriptions.
   */
  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private highlightService: HighlightService<TData, TFilters>
  ) {}

  ngOnInit(): void {
    // Subscribe to highlight state changes to re-evaluate when state changes
    this.highlightService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyHighlight();
      });

    // Initial evaluation
    this.applyHighlight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-evaluate when data input changes
    if (changes['data'] && !changes['data'].firstChange) {
      this.applyHighlight();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Remove any applied classes
    this.removeAppliedClasses();
  }

  /**
   * Evaluates highlight rules and applies CSS classes to the host element.
   */
  private applyHighlight(): void {
    // Remove previously applied classes
    this.removeAppliedClasses();

    // If no data, nothing to highlight
    if (!this.data) {
      return;
    }

    // Evaluate highlight rules
    const result = this.highlightService.evaluate(this.data);

    // Apply new classes if highlighting is active
    if (result.shouldHighlight && result.cssClasses) {
      const classes = result.cssClasses.split(/\s+/).filter(c => c.length > 0);
      classes.forEach(cssClass => {
        this.renderer.addClass(this.elementRef.nativeElement, cssClass);
      });
      this.appliedClasses = classes;
    }
  }

  /**
   * Removes all previously applied highlight classes from the host element.
   */
  private removeAppliedClasses(): void {
    this.appliedClasses.forEach(cssClass => {
      this.renderer.removeClass(this.elementRef.nativeElement, cssClass);
    });
    this.appliedClasses = [];
  }
}
