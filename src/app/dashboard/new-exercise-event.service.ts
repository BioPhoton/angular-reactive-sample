import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {map, switchMap, startWith, concatMap, tap} from 'rxjs/operators';
import {Subject} from 'rxjs/Subject';

import {BASE_URL} from '../app.tokens';

import {ChartData} from './chart-data';
import {EventStats} from './event-stats';
import {Exercise} from './exercise';
import {ExerciseEvent, ExerciseEventType} from './exercise-event';
import {ExerciseService} from './exercise.service';

declare let EventSource: any;

declare let require: any;

let iassign = require("immutable-assign");

@Injectable()
export class NewExerciseEventService {

  // Senken
  private chartData: ChartData[] = [
    {data: [], label: 'VIEWED'},
    {data: [], label: 'STARTED'},
    {data: [], label: 'COMPLETED'},
    {data: [], label: 'ABORTED'}
  ];

  // Housekeeping
  private events = [];
  private closeSubject = new Subject<void>();

  // Quellen
  public allExercises$: Observable<Exercise[]> = this.exerciseService.findAll()

  private exercisesSubject = new BehaviorSubject<Exercise[]>([]);
  public exercises$: Observable<Exercise[]> = this.exercisesSubject.asObservable();


  private chartDataSubject = new BehaviorSubject<any>([]);
  public chartData$: Observable<any> = this.chartDataSubject.asObservable();

  constructor(
    @Inject(BASE_URL) private baseUrl: string,
    private http: HttpClient,
    private exerciseService: ExerciseService
  ) {

    /* this.chartData$ =
     this
     .exercises$.pipe(
     map(e => this.mapExercisesToUrls(e)),
     switchMap(urls => this.getEventStream(urls)),
     //map(event => this.updateStatistics(event)),
     //startWith(this.chartData),
     tap(chartData =>  { console.log('new chartData', chartData) })
     //tap(chartData => console.debug('chartData', chartData))
     );
     */
    this.chartData$ = this
      .exercises$
      .pipe(
        tap(e => console.log('ee', e)),
        concatMap(x => x),
        tap(e => console.log('eee', e, e.id)),
        switchMap((e: any) => this.findInitStats(e.id)),
        tap(stats => console.log('initData1', stats)),
        startWith(this.chartData as any),
        map(initData => {
          return this.mergeStatistics(initData)
        }),
        tap(stats => console.log('initData2', stats))
      )



  }

  private mergeStatistics(stats: EventStats): ChartData[] {

    const initValues = [stats.VIEWED, stats.STARTED, stats.COMPLETED, stats.ABORTED];
    const index = this.idToIndex(stats.exerciseId);

    if (index === -1) {
      return this.chartData;
    }

    for (let i = 0; i < initValues.length; i++) {
      console.log('ASdf', stats, this.chartData, i, index);
      this.chartData = iassign(
        this.chartData,
        s => s[i].data[index],
        data => initValues[i]
      );
    }

    return this.chartData;
  }

  public addExercise(exercise: Exercise) {
    console.log('exerciseexercise', exercise)
    const actExer = this.exercisesSubject.getValue();

    if (actExer.find(e => e.id === exercise.id)) {
      return;
    }

    actExer.push(exercise);
    console.log('actExer', actExer)
    this.exercisesSubject.next(actExer);

  }

  public removeExercise(exercise: Exercise) {
    /* let actExer = this.exercisesSubject.getValue();
     const index = actExer.findIndex(e => e.id === exercise.id);
     if (index === -1) {
     return;
     }

     this.removeChartData(index);

     actExer = [
     ...actExer.slice(0, index),
     ...actExer.slice(index + 1),
     ];

     this.exercisesSubject.next(actExer);*/
  }

  private findInitStats(exerciseId: string): Observable<EventStats> {
    console.log('e id', exerciseId)
    return this.http.get<EventStats>(this.mapExerciseIdToUrl(exerciseId)).map(stats => {
      return {...stats, exerciseId}
    });
  }

  private getEventStream(urls: string[]): Observable<ExerciseEvent> {

    this.events = urls.map(url => new EventSource(url));
    const events$: Observable<MessageEvent>[] = this.events.map(e => Observable.fromEvent(e, 'message'));

    return Observable.of('very hacky!')
      // switchMap => kein closeEvents muss aber noch getested werden
      .switchMap((n) => Observable.merge<MessageEvent>(...events$))
      .pipe(
        map(event => JSON.parse(event.data) as ExerciseEvent),
        tap(event => console.debug('event', event))
      );

  }


  private mapExerciseIdToUrl(exerciseId: string): string {
    return this.baseUrl + `/exercises/${encodeURIComponent(exerciseId)}/eventstats`;
  }

  private mapExercisesToUrls(exercises: Exercise[]): string[] {
    return exercises.map(e => this.baseUrl + `/exercises/${decodeURIComponent(e.id)}/eventstream`);
  }

  private eventTypeToIndex(type: ExerciseEventType) {
    switch (type) {
      case 'VIEWED':
        return 0;
      case 'STARTED':
        return 1;
      case 'COMPLETED':
        return 2;
      case 'ABORTED':
        return 3;
      default:
        console.error('Unsupported EventType ' + type);
        return 0;
    }
  }

  private idToIndex(eventId: string) {
    return this.exercisesSubject.getValue().findIndex(e => e.id === eventId);
  }

}
