import { ChartData } from './chart-data';
import { ExerciseEventService } from './exercise-event.service';
import { Exercise } from './exercise';
import { ExerciseService } from './exercise.service';
import { register } from 'ts-node/dist';
import { BehaviorSubject, Subject } from 'rxjs/Rx';
import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { ExerciseEvent, ExerciseEventType } from './exercise-event';

declare let EventSource: any;
declare let require: any;

var iassign = require("immutable-assign");


@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  public chartData$: Observable<ChartData[]>;
  public exerciseTitles$: Observable<string[]>;

  public allExercises$: Observable<Exercise[]>;
  public exercises$: Observable<Exercise[]>;

  public barChartOptions: any = {
    scaleShowVerticalLines: true,
    responsive: true,
    scales: {
      yAxes: [{
          ticks: {
            beginAtZero: true
          }
      }]
  }
  };

  public lineChartColors:Array<any> = [
    { backgroundColor: '#1565C0' },
    { backgroundColor: '#03A9F4' },
    { backgroundColor: '#FFA726' },
    { backgroundColor: '#FFCC80' }
  ];

  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  constructor(
    private exerciseService: ExerciseService,
    private eventService: ExerciseEventService) {
  }

  ngOnInit(): void {

    this.allExercises$ = this.eventService.allExercises$;

    this.exerciseTitles$ = this.eventService.exercises$.map(e => e.map(e => e.title));
    this.chartData$ = this.eventService.chartData$;

    this.exerciseTitles$.subscribe(t => console.debug('titles', t));

  }

  get count() {
    return this.eventService.count;
  }

  filterChanged(e: Exercise, change: MatCheckboxChange) {

    if (change.checked) {
      this.eventService.addExercise(e);
    }
    else {
      this.eventService.removeExercise(e);
    }
  }


}
