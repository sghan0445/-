
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE'
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  width: number;
  height: number;
  color: string;
}

export interface Ball extends Point {
  radius: number;
  dx: number;
  dy: number;
  speed: number;
  color: string;
}

export interface Paddle extends Entity {
  speed: number;
  isMovingLeft: boolean;
  isMovingRight: boolean;
}

export interface Brick extends Entity {
  strength: number;
  points: number;
  alive: boolean;
}

export interface GameState {
  score: number;
  level: number;
  lives: number;
  status: GameStatus;
}
