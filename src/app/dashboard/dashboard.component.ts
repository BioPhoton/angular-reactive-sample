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
  
  public exercises: Exercise[] = [];

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

    this.exerciseService.findAll().subscribe(
      e => this.exercises = e,
      err => console.error('Error Loading Exercises', err)
    );

    this.exerciseTitles$ = this.eventService.exercises$.map(e => e.map(e => e.title));
    this.chartData$ = this.eventService.chartData$;
    
    this.exerciseTitles$.subscribe(t => console.debug('titles', t));


    /*
    this.eventService.addExercise({ id: 'b7bf16e2-46fa-4411-9b1e-2a9e05d3be82', title: 'Test 1' });
    this.eventService.addExercise({ id: '9da01173-f6da-4409-9177-4a5a18c6b484', title: 'Test 2' });
    */


    /*
    this.urls$.next([
        'http://hpgrahsl.northeurope.cloudapp.azure.com:8080/dashboard/api/exercises/b7bf16e2-46fa-4411-9b1e-2a9e05d3be82/eventstream',
        'http://hpgrahsl.northeurope.cloudapp.azure.com:8080/dashboard/api/exercises/9da01173-f6da-4409-9177-4a5a18c6b484/eventstream'
    ]);
    */
       

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
/*
export class DashboardComponent {

  colorScheme: any = {
    domain: ['#1565C0', '#03A9F4', '#FFA726', '#FFCC80'],
  };

}


*/
