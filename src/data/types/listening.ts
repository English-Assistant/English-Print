/**
 * @file
 * @description Defines the data structure for listening material.
 * This corresponds to the `listening.schema.json`.
 */

export interface Character {
  name: string;
  gender: 'Male' | 'Female';
}

export interface ListeningMaterial {
  characters: Character[];
  dialogues: Dialogue[];
}

export interface Dialogue {
  id: string;
  number: number;
  lines: Line[];
}

export interface Line {
  character: string;
  sentence: string;
}
