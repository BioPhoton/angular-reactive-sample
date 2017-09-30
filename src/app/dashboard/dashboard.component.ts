import { Component, OnInit } from '@angular/core';
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

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  public lineChartColors:Array<any> = [
    { backgroundColor: '#1565C0' },
    { backgroundColor: '#03A9F4' },
    { backgroundColor: '#FFA726' },
    { backgroundColor: '#FFCC80' }
  ];

  public barChartLabels: string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartData: any[] = [
    {data: [65], label: 'VIEWED'},
    {data: [28], label: 'INPROGRESS'},
    {data: [28], label: 'COMPLETED'},
  ];

  public barChartData$: Observable<any>;

  private updateStatistics(e: ExerciseEvent) {
    let eventTypeIndex = this.eventTypeToIndex(e.what);
    let idIndex = this.idToIndex(e.exerciseId);

    this.barChartData = iassign(
      this.barChartData,
      s => s[eventTypeIndex].data[idIndex],
      s => s + 1
    );

    return this.barChartData;
  }

  private eventTypeToIndex(type: ExerciseEventType) {
    switch (type) {
      case 'VIEWED': return 0;
      case 'INPROGRESS': return 1;
      case 'COMPLETED': return 2;
      default: throw new Error('Unsupported EventType ' + type);
    }
  }

  private idToIndex(eventId: string) {
    return 0;
  }

  ngOnInit(): void {
    this.barChartData$ =
          this
            .register()
            .map(event => this.updateStatistics(event))
            .do(event => console.debug('updateStatistics', event))
            .startWith(this.barChartData);
  }

  register(): Observable<ExerciseEvent> {

    let event1 = new EventSource('http://hpgrahsl.northeurope.cloudapp.azure.com:8080/dashboard/api/exercises/b7bf16e2-46fa-4411-9b1e-2a9e05d3be82/eventstream');

    return Observable.merge<MessageEvent>(
      Observable.fromEvent(event1, 'message')
    ).map(event => JSON.parse(event.data) as ExerciseEvent);
  }
}
/*
export class DashboardComponent {

  colorScheme: any = {
    domain: ['#1565C0', '#03A9F4', '#FFA726', '#FFCC80'],
  };

}


*/
