export type ExerciseEventType = 'VIEWED' | 'STARTED' |  'COMPLETED' | 'ABORTED';

export interface ExerciseEvent {
  exerciseId: string;
  userId: string;
  when: string;
  what: ExerciseEventType;
}
