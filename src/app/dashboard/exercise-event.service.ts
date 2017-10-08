import { BASE_URL } from '../app.tokens';
import { ChartData } from './chart-data';
import { ExerciseEvent, ExerciseEventType } from './exercise-event';
import { BehaviorSubject, Subject } from 'rxjs/Rx';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Exercise } from './exercise';

declare let EventSource: any;
declare let require: any;

let iassign = require("immutable-assign");

@Injectable()
export class ExerciseEventService {

    private exercises: Exercise[] = [];
    private exercisesSubject = new BehaviorSubject<Exercise[]>([]);
    public exercises$: Observable<Exercise[]> = this.exercisesSubject.asObservable();

    private chartData: ChartData[] = [
        {data: [], label: 'VIEWED'},
        {data: [], label: 'STARTED'},
        {data: [], label: 'COMPLETED'},
        {data: [], label: 'ABORTED'}
      ];

    private startValues$ = new BehaviorSubject<ChartData[]>(this.chartData);

    public chartData$: Observable<ChartData[]>;
    
    

    constructor(@Inject(BASE_URL) private baseUrl: string) { 

        let calculatedValues$: Observable<ChartData[]> = 
                                this
                                    .exercises$
                                    .map(e => this.mapExercisesToUrls(e))
                                    .do(urls => console.debug('urls1', urls))
                                    .switchMap(urls => this.registerForEvents(urls))
                                    .map(event => this.updateStatistics(event))
                                    .do(event => console.debug('updateStatistics', event))
                                    .startWith(this.chartData);

        this.chartData$ = Observable.merge(calculatedValues$, this.startValues$);


    }

    public addExercise(exercise: Exercise) {
        if (this.exercises.find(e => e.id == exercise.id)) return;

        this.addChartData();
        this.exercises.push(exercise);
        this.exercisesSubject.next(this.exercises);
        
        setTimeout(() => this.startValues$.next(this.chartData), 0);
    }

    private addChartData() {
        
        for(let i=0; i<=3; i++) {
            let rnd = 15 + Math.floor(Math.random() * 16);
            this.chartData = iassign(
                this.chartData,
                s => s[i].data,
                data => [...data, rnd]
            );
        }

        console.debug('new chartData', this.chartData);
    }

    public removeExercise(exercise: Exercise) {
        let index = this.exercises.findIndex(e => e.id == exercise.id);
        if (index == -1) return;

        this.removeChartData(index);

        this.exercises = [
            ...this.exercises.slice(0, index),
            ...this.exercises.slice(index+1),
        ];

        this.exercisesSubject.next(this.exercises);
        // this.startValues$.next(this.chartData);
    }

    private removeChartData(index: number) {
        for(let i=0; i<=3; i++) {
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
        
            // TODO: Unsubscribe old Observables and close old EventSources

            let events = urls.map(url => new EventSource(url));
            let events$: Observable<MessageEvent>[] = events.map(e => Observable.fromEvent(e, 'message'));
        
            return Observable.merge<MessageEvent>(...events$)
                  .map(event => JSON.parse(event.data) as ExerciseEvent)
                  .do(event => console.debug('event', event));
    }

    private updateStatistics(e: ExerciseEvent) {
        let eventTypeIndex = this.eventTypeToIndex(e.what);
        let idIndex = this.idToIndex(e.exerciseId);
    
        for (let i = 0; i<= 3; i++) {
            this.chartData = iassign(
                this.chartData,
                s => s[i].data[idIndex],
                s => (i == idIndex) ? s + 1 : s - 1
            );
        }
    
        return this.chartData;
      }
    
      private eventTypeToIndex(type: ExerciseEventType) {
        switch (type) {
          case 'VIEWED': return 0;
          case 'STARTED': return 1;
          case 'COMPLETED': return 2;
          case 'ABORTED': return 3;
          default: throw new Error('Unsupported EventType ' + type);
        }
      }
    
      private idToIndex(eventId: string) {
        return this.exercises.findIndex(e => e.id == eventId);
      }
    

}