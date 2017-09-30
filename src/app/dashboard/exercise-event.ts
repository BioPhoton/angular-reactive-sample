export type ExerciseEventType = 'VIEWED' | 'INPROGRESS' | 'COMPLETED';

export interface ExerciseEvent {
  exerciseId: string;
  userId: string;
  when: string;
  what: ExerciseEventType;
}
