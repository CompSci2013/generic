import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';

const PRIMENG_MODULES = [
  TableModule,
  ButtonModule,
  InputTextModule,
  MultiSelectModule,
  ToastModule,
  PanelModule,
  CardModule,
  DropdownModule,
  CheckboxModule,
  SliderModule,
  DialogModule,
  ProgressSpinnerModule,
  TooltipModule,
  ChipModule,
  DividerModule,
];

@NgModule({
  imports: PRIMENG_MODULES,
  exports: PRIMENG_MODULES
})
export class PrimengModule { }
