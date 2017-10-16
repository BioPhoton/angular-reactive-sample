import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {map, startWith, switchMap, takeUntil, tap} from 'rxjs/operators';
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
export class ExerciseEventService {

  // Housekeeping
  private events = [];
  private closeSubject = new Subject<void>();

  // Quellen
  private allExercisesSubject = new BehaviorSubject<Exercise[]>([]);
  public allExercises$: Observable<Exercise[]> = this.allExercisesSubject.asObservable();
  private exercisesSubject = new BehaviorSubject<Exercise[]>([]);
  public exercises$: Observable<Exercise[]> = this.exercisesSubject.asObservable();

  public get count(): number {
    return this.exercisesSubject.getValue().length;
  }

  private exerciseAddedSubject = new Subject<Exercise>();

  // Senken

  private chartData: ChartData[] = [
    {data: [], label: 'VIEWED'},
    {data: [], label: 'STARTED'},
    {data: [], label: 'COMPLETED'},
    {data: [], label: 'ABORTED'}
  ];

  public chartData$: Observable<ChartData[]>;

  constructor(
    @Inject(BASE_URL) private baseUrl: string,
    private http: HttpClient,
    private exerciseService: ExerciseService
  ) {

    this.exerciseService
      .findAll()
      .subscribe(
        n => this.allExercisesSubject.next(n)
      );

    const initValues$ = this
      .exerciseAddedSubject.pipe(
        switchMap(e => this.findInitStats(e.id)),
        map(initData => {
          console.log('initData', initData);
          return this.mergeStatistics(initData)
        })
      );


    const calculatedValues$: Observable<ChartData[]> =
      this
        .exercises$.pipe(
        map(e => this.mapExercisesToUrls(e)),
        switchMap(urls => this.registerForEvents(urls)),
        map(event => this.updateStatistics(event)),
        startWith(this.chartData),
        tap(chartData => console.debug('chartData', chartData))
      );

    this.chartData$ = Observable.merge(calculatedValues$, initValues$);

  }

  findInitStats(exerciseId: string): Observable<EventStats> {
    console.log('exerciseId', exerciseId)
    const url = this.baseUrl + `/exercises/${encodeURIComponent(exerciseId)}/eventstats`;
    return this.http.get<EventStats>(url).map(stats => {
      return {...stats, exerciseId}
    });
  }

  public addExercise(exercise: Exercise) {
    const actExer = this.exercisesSubject.getValue();

    if (actExer.find(e => e.id === exercise.id)) {
      return;
    }

    this.addChartData();
    actExer.push(exercise);

    this.exerciseAddedSubject.next(exercise);
    this.exercisesSubject.next(actExer);

  }

  private addChartData() {

    for (let i = 0; i <= 3; i++) {
      const init = 0;
      this.chartData = iassign(
        this.chartData,
        s => s[i].data,
        data => [...data, init]
      );
    }

    console.debug('new chartData', this.chartData);
  }

  private mergeStatistics(stats: EventStats): ChartData[] {

    const initValues = [stats.VIEWED, stats.STARTED, stats.COMPLETED, stats.ABORTED];
    const index = this.idToIndex(stats.exerciseId);

    for (let i = 0; i < initValues.length; i++) {
      const init = 0;
      this.chartData = iassign(
        this.chartData,
        s => s[i].data[index],
        data => initValues[i]
      );
    }

    return this.chartData;
  }

  public removeExercise(exercise: Exercise) {
    let actExer = this.exercisesSubject.getValue();
    const index = actExer.findIndex(e => e.id === exercise.id);
    if (index === -1) {
      return;
    }

    this.removeChartData(index);

    actExer = [
      ...actExer.slice(0, index),
      ...actExer.slice(index + 1),
    ];

    this.exercisesSubject.next(actExer);
  }

  private removeChartData(index: number) {
    for (let i = 0; i <= 3; i++) {
      this.chartData = iassign(
        this.chartData,
        s => s[i].data,
        data => [
          ...data.slice(0, index),
          ...data.slice(index + 1),
        ]
      );
    }

    console.debug('new chart data', this.chartData);
  }

  private mapExercisesToUrls(exercises: Exercise[]): string[] {
    return exercises.map(e => this.baseUrl + `/exercises/${decodeURIComponent(e.id)}/eventstream`);
  }

  private registerForEvents(urls: string[]): Observable<ExerciseEvent> {

    this.closeOldEvents();

    this.events = urls.map(url => new EventSource(url));
    const events$: Observable<MessageEvent>[] = this.events.map(e => Observable.fromEvent(e, 'message'));

    return Observable
      .merge<MessageEvent>(...events$)
      .pipe(
        takeUntil(this.closeSubject),
        map(event => JSON.parse(event.data) as ExerciseEvent),
        tap(event => console.debug('event', event))
      );

  }

  private closeOldEvents() {
    this.events.forEach(e => e.close());
    this.closeSubject.next();
  }

  private updateStatistics(e: ExerciseEvent) {
    const index = this.eventTypeToIndex(e.what);
    const idIndex = this.idToIndex(e.exerciseId);

    this.chartData = iassign(
      this.chartData,
      s => s[index].data[idIndex],
      s => s + 1
    );

    return this.chartData;
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
