export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export interface Position {
  x: number
  y: number
}

export type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'

export const GRID_WIDTH = 20
export const GRID_HEIGHT = 20
export const TICK_MS = 120
export const POINTS_PER_FOOD = 10

export const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
]

export const INITIAL_DIRECTION: Direction = 'RIGHT'
