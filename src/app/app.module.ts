import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CovalentDataTableModule, CovalentLayoutModule, CovalentMediaModule } from '@covalent/core';
import {
  MdDialogModule, MdSidenavModule, MdToolbarModule, MdIconModule, MdTooltipModule,
  MdListModule, MdButtonModule, MdInputModule, MdMenuModule, MdCardModule, MdSnackBarModule, MdCheckboxModule
} from '@angular/material';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TestCardComponent } from './test-card/test-card.component';
import { ChartsModule } from 'ng2-charts';

const CONTROL_MODULES = [
  MdCardModule,
  MdMenuModule,
  MdInputModule,
  MdButtonModule,
  MdListModule,
  MdIconModule,
  MdSidenavModule,
  MdToolbarModule,
  MdTooltipModule,
  MdDialogModule,
  MdSnackBarModule,
  MdCheckboxModule,
  CovalentLayoutModule,
  CovalentMediaModule,
  CovalentDataTableModule,
  ChartsModule
  //NgxChartsModule
];


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    CONTROL_MODULES
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    TestCardComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
