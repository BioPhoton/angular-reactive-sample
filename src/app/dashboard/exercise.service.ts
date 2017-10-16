import { EventStats } from './event-stats';
import { ExerciseEvent } from './exercise-event';
import { Observable } from 'rxjs/Rx';
import { Exercise } from './exercise';
import { BASE_URL } from '../app.tokens';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class ExerciseService {

    constructor(
        @Inject(BASE_URL) private baseUrl: string,
        private http: HttpClient) { }

    findAll(): Observable<Exercise[]> {
        let url = this.baseUrl + '/exercises';
        return this.http.get<Exercise[]>(url)
          .catch((err) => {
          console.error('Error Loading Exercises', err);
            return Observable.throw([]);
        });
    }



    postState(event: ExerciseEvent) {
        let url = this.baseUrl + '/exercises/events';
        return this.http.post<Exercise>(url, event);
    }

}
