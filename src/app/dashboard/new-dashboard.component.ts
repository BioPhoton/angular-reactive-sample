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
import {NewExerciseEventService} from './new-exercise-event.service';

declare let EventSource: any;
declare let require: any;

var iassign = require("immutable-assign");


@Component({
  selector: 'new-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class NewDashboardComponent implements OnInit {

  public chartData$: Observable<ChartData[]>;
  public exerciseTitles$: Observable<string[]>;

  public allExercises$: Observable<Exercise[]>;

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
    private eventService: ExerciseEventService,
    private newEventService: NewExerciseEventService) {

    this.newEventService.exercises$
      .subscribe(
        (n) => { console.log('new exercises$', n) }
      )

    this.newEventService.chartData$
      .subscribe(
        (n) => { console.log('new chartData$', n) }
      )
    this.eventService.chartData$.subscribe(
      (n) => { console.log('old chartData$', n) }
    )
  }

  ngOnInit(): void {

    this.allExercises$ = this.eventService.allExercises$;

    this.exerciseTitles$ = this.eventService.exercises$.map(e => e.map(e => e.title));
    this.chartData$ = this.newEventService.chartData$;//this.eventService.chartData$;

    this.exerciseTitles$.subscribe(t => console.debug('titles', t));

  }

  get count() {
    return this.eventService.count;
  }

  filterChanged(e: Exercise, change: MatCheckboxChange) {

    if (change.checked) {
      this.eventService.addExercise(e);
      this.newEventService.addExercise(e);
    }
    else {
      this.eventService.removeExercise(e);
    }
  }


}
