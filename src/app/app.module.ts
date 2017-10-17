import { ExerciseEventService } from './dashboard/exercise-event.service';
import { ExerciseService } from './dashboard/exercise.service';
import { BASE_URL } from './app.tokens';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CovalentDataTableModule, CovalentLayoutModule, CovalentMediaModule } from '@covalent/core';
import {
  MatSelectModule,
  MatDialogModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatTooltipModule,
  MatListModule, MatButtonModule, MatInputModule, MatMenuModule, MatCardModule, MatSnackBarModule, MatCheckboxModule
} from '@angular/material';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TestCardComponent } from './test-card/test-card.component';
import { ChartsModule } from 'ng2-charts';
import { SendEventComponent } from './send-event/send-event.component';
import {NewDashboardComponent} from './dashboard/new-dashboard.component';
import {NewExerciseEventService} from './dashboard/new-exercise-event.service';

const CONTROL_MODULES = [
  MatCardModule,
  MatMenuModule,
  MatInputModule,
  MatButtonModule,
  MatListModule,
  MatIconModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTooltipModule,
  MatDialogModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatSelectModule,
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
    NewDashboardComponent,
    TestCardComponent,
    SendEventComponent
],
  providers: [
    ExerciseService,
    ExerciseEventService,
    NewExerciseEventService,
    { provide: BASE_URL, useValue: 'http://hpgrahsl.northeurope.cloudapp.azure.com:8080/dashboard/api'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
