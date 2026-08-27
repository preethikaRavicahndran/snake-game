import type { Direction, Position } from './types'

/** Compute the next head position given a direction. */
export function nextHead(head: Position, direction: Direction): Position {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - 1 }
    case 'DOWN':
      return { x: head.x, y: head.y + 1 }
    case 'LEFT':
      return { x: head.x - 1, y: head.y }
    case 'RIGHT':
      return { x: head.x + 1, y: head.y }
  }
}

/**
 * Move the snake one step.
 * @param snake  Full segment array, head first.
 * @param direction  Current direction of travel.
 * @param grow  When true the tail is preserved (food was just eaten).
 * @returns New segment array with updated head position.
 */
export function moveSnake(
  snake: Position[],
  direction: Direction,
  grow: boolean,
): Position[] {
  const head = snake[0]
  const newHead = nextHead(head, direction)
  const newBody = grow ? snake : snake.slice(0, snake.length - 1)
  return [newHead, ...newBody]
}

/**
 * Returns true when the head is outside the grid boundaries.
 */
export function checkWallCollision(
  head: Position,
  gridWidth: number,
  gridHeight: number,
): boolean {
  return head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight
}

/**
 * Returns true when the head occupies any segment of the body.
 * @param head  The new head position (already moved).
 * @param body  All segments EXCEPT the new head (i.e. the rest of the snake).
 */
export function checkSelfCollision(head: Position, body: Position[]): boolean {
  return body.some((seg) => seg.x === head.x && seg.y === head.y)
}

/**
 * Generate a food position that does not overlap with any snake segment.
 * Uses a rejection-sampling loop with a finite safety bound.
 */
export function generateFoodPosition(
  snake: Position[],
  gridWidth: number,
  gridHeight: number,
): Position {
  const totalCells = gridWidth * gridHeight
  const snakeSet = new Set(snake.map((s) => `${s.x},${s.y}`))

  // Collect all free cells then pick one randomly — O(n) but deterministic bound.
  const free: Position[] = []
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (!snakeSet.has(`${x},${y}`)) {
        free.push({ x, y })
      }
    }
  }

  if (free.length === 0) {
    // Edge case: board is completely full — return center as fallback.
    return { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }
  }

  // Suppress unused variable warning; totalCells used only as upper guard above.
  void totalCells

  return free[Math.floor(Math.random() * free.length)]
}

/**
 * Returns true when changing from `current` to `next` is a valid move.
 * A 180-degree reversal (e.g. UP → DOWN) is disallowed.
 */
export function isValidDirectionChange(
  current: Direction,
  next: Direction,
): boolean {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  }
  return opposites[current] !== next
}
