import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';

import {Exercise} from '../dashboard/exercise';
import {ExerciseEvent, ExerciseEventType} from '../dashboard/exercise-event';
import {ExerciseService} from '../dashboard/exercise.service';

const USER_ID = 'cce9fe86-a7a9-466e-ae71-a5eaa4e5d8bb';

@Component({
  selector: 'send-event',
  templateUrl: './send-event.component.html',
  styleUrls: ['./send-event.component.css']
})
export class SendEventComponent implements OnInit {

  constructor(
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) { }

  public exercises: Exercise[] = [];
  public states: ExerciseEventType[] = ['VIEWED', 'STARTED', 'COMPLETED', 'ABORTED'];

  public selectedExerciseId: string;
  public selectedState: ExerciseEventType;

  ngOnInit() {
    // TODO: Flux?
    this.exerciseService.findAll().subscribe(
      e => this.exercises = e,
      err => console.error('error loading exercises', err)
    );
  }

  postState() {

    if (!this.selectedExerciseId || !this.selectedState) {
      this.snackBar.open('Please provide both, a exercise and a state!');
      return;
    }

    let event: ExerciseEvent = {
      exerciseId: this.selectedExerciseId,
      userId: USER_ID,
      what: this.selectedState,
      when: '2017-09-02T23:06:00.000'
    };

    this.exerciseService.postState(event).subscribe(
      _ => console.debug('event successfully sent'),
      err => console.error('error sending event', err)
    );

  }

}
