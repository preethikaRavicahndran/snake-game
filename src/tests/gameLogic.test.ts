import { describe, it, expect } from 'vitest'
import {
  moveSnake,
  checkWallCollision,
  checkSelfCollision,
  generateFoodPosition,
  isValidDirectionChange,
  nextHead,
} from '../engine/gameLogic'
import type { Position } from '../engine/types'

// ─── nextHead ────────────────────────────────────────────────────────────────

describe('nextHead', () => {
  const origin: Position = { x: 5, y: 5 }

  it('moves UP (y decreases)', () => {
    expect(nextHead(origin, 'UP')).toEqual({ x: 5, y: 4 })
  })

  it('moves DOWN (y increases)', () => {
    expect(nextHead(origin, 'DOWN')).toEqual({ x: 5, y: 6 })
  })

  it('moves LEFT (x decreases)', () => {
    expect(nextHead(origin, 'LEFT')).toEqual({ x: 4, y: 5 })
  })

  it('moves RIGHT (x increases)', () => {
    expect(nextHead(origin, 'RIGHT')).toEqual({ x: 6, y: 5 })
  })
})

// ─── moveSnake ───────────────────────────────────────────────────────────────

describe('moveSnake', () => {
  const snake: Position[] = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]

  it('prepends new head and drops tail when NOT growing', () => {
    const result = moveSnake(snake, 'RIGHT', false)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ x: 6, y: 5 }) // new head
    expect(result[1]).toEqual({ x: 5, y: 5 }) // old head became body
    expect(result[2]).toEqual({ x: 4, y: 5 }) // middle segment
    // old tail { x:3, y:5 } must be dropped
    expect(result.find((s) => s.x === 3 && s.y === 5)).toBeUndefined()
  })

  it('prepends new head and PRESERVES tail when growing', () => {
    const result = moveSnake(snake, 'RIGHT', true)
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({ x: 6, y: 5 })
    expect(result[3]).toEqual({ x: 3, y: 5 }) // tail preserved
  })

  it('moves UP correctly', () => {
    const result = moveSnake(snake, 'UP', false)
    expect(result[0]).toEqual({ x: 5, y: 4 })
  })

  it('moves DOWN correctly', () => {
    const result = moveSnake(snake, 'DOWN', false)
    expect(result[0]).toEqual({ x: 5, y: 6 })
  })

  it('moves LEFT correctly', () => {
    const result = moveSnake(snake, 'LEFT', false)
    expect(result[0]).toEqual({ x: 4, y: 5 })
  })

  it('single-segment snake grows to two segments', () => {
    const single: Position[] = [{ x: 2, y: 2 }]
    const result = moveSnake(single, 'RIGHT', true)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ x: 3, y: 2 })
    expect(result[1]).toEqual({ x: 2, y: 2 })
  })

  it('single-segment snake stays one segment when not growing', () => {
    const single: Position[] = [{ x: 2, y: 2 }]
    const result = moveSnake(single, 'LEFT', false)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ x: 1, y: 2 })
  })
})

// ─── checkWallCollision ──────────────────────────────────────────────────────

describe('checkWallCollision', () => {
  const W = 20
  const H = 20

  it('returns false for a position well inside the grid', () => {
    expect(checkWallCollision({ x: 10, y: 10 }, W, H)).toBe(false)
  })

  it('detects left-wall collision (x < 0)', () => {
    expect(checkWallCollision({ x: -1, y: 5 }, W, H)).toBe(true)
  })

  it('detects right-wall collision (x >= gridWidth)', () => {
    expect(checkWallCollision({ x: 20, y: 5 }, W, H)).toBe(true)
    expect(checkWallCollision({ x: 19, y: 5 }, W, H)).toBe(false)
  })

  it('detects top-wall collision (y < 0)', () => {
    expect(checkWallCollision({ x: 5, y: -1 }, W, H)).toBe(true)
  })

  it('detects bottom-wall collision (y >= gridHeight)', () => {
    expect(checkWallCollision({ x: 5, y: 20 }, W, H)).toBe(true)
    expect(checkWallCollision({ x: 5, y: 19 }, W, H)).toBe(false)
  })

  it('corner (0,0) is valid', () => {
    expect(checkWallCollision({ x: 0, y: 0 }, W, H)).toBe(false)
  })

  it('corner (19,19) is valid', () => {
    expect(checkWallCollision({ x: 19, y: 19 }, W, H)).toBe(false)
  })

  it('detects collision exactly at right/bottom boundary', () => {
    expect(checkWallCollision({ x: W, y: 0 }, W, H)).toBe(true)
    expect(checkWallCollision({ x: 0, y: H }, W, H)).toBe(true)
  })
})

// ─── checkSelfCollision ──────────────────────────────────────────────────────

describe('checkSelfCollision', () => {
  const body: Position[] = [
    { x: 4, y: 5 },
    { x: 3, y: 5 },
    { x: 2, y: 5 },
  ]

  it('returns false when head does not overlap body', () => {
    expect(checkSelfCollision({ x: 5, y: 5 }, body)).toBe(false)
  })

  it('returns true when head coincides with first body segment', () => {
    expect(checkSelfCollision({ x: 4, y: 5 }, body)).toBe(true)
  })

  it('returns true when head coincides with middle body segment', () => {
    expect(checkSelfCollision({ x: 3, y: 5 }, body)).toBe(true)
  })

  it('returns true when head coincides with last body segment (tail)', () => {
    expect(checkSelfCollision({ x: 2, y: 5 }, body)).toBe(true)
  })

  it('returns false with an empty body', () => {
    expect(checkSelfCollision({ x: 5, y: 5 }, [])).toBe(false)
  })

  it('only checks x and y equality, not object reference', () => {
    const head: Position = { x: 3, y: 5 }
    expect(checkSelfCollision(head, body)).toBe(true)
  })
})

// ─── generateFoodPosition ────────────────────────────────────────────────────

describe('generateFoodPosition', () => {
  const W = 20
  const H = 20

  it('never places food on a snake segment', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ]
    for (let i = 0; i < 50; i++) {
      const food = generateFoodPosition(snake, W, H)
      const onSnake = snake.some((s) => s.x === food.x && s.y === food.y)
      expect(onSnake).toBe(false)
    }
  })

  it('returns a position within grid bounds', () => {
    const snake: Position[] = [{ x: 10, y: 10 }]
    const food = generateFoodPosition(snake, W, H)
    expect(food.x).toBeGreaterThanOrEqual(0)
    expect(food.x).toBeLessThan(W)
    expect(food.y).toBeGreaterThanOrEqual(0)
    expect(food.y).toBeLessThan(H)
  })

  it('handles a snake that occupies all but one cell', () => {
    // Fill entire board except (0,0)
    const snake: Position[] = []
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        if (!(x === 0 && y === 0)) snake.push({ x, y })
      }
    }
    const food = generateFoodPosition(snake, W, H)
    expect(food).toEqual({ x: 0, y: 0 })
  })

  it('falls back to center when board is completely full', () => {
    const snake: Position[] = []
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        snake.push({ x, y })
      }
    }
    const food = generateFoodPosition(snake, W, H)
    expect(food).toEqual({ x: Math.floor(W / 2), y: Math.floor(H / 2) })
  })
})

// ─── isValidDirectionChange ──────────────────────────────────────────────────

describe('isValidDirectionChange', () => {
  it('allows RIGHT → UP', () => expect(isValidDirectionChange('RIGHT', 'UP')).toBe(true))
  it('allows RIGHT → DOWN', () => expect(isValidDirectionChange('RIGHT', 'DOWN')).toBe(true))
  it('allows UP → LEFT', () => expect(isValidDirectionChange('UP', 'LEFT')).toBe(true))
  it('allows UP → RIGHT', () => expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true))
  it('allows DOWN → LEFT', () => expect(isValidDirectionChange('DOWN', 'LEFT')).toBe(true))
  it('allows DOWN → RIGHT', () => expect(isValidDirectionChange('DOWN', 'RIGHT')).toBe(true))
  it('allows LEFT → UP', () => expect(isValidDirectionChange('LEFT', 'UP')).toBe(true))
  it('allows LEFT → DOWN', () => expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true))

  it('blocks UP → DOWN (180°)', () => expect(isValidDirectionChange('UP', 'DOWN')).toBe(false))
  it('blocks DOWN → UP (180°)', () => expect(isValidDirectionChange('DOWN', 'UP')).toBe(false))
  it('blocks LEFT → RIGHT (180°)', () => expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false))
  it('blocks RIGHT → LEFT (180°)', () => expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false))

  it('allows same direction (UP → UP)', () => expect(isValidDirectionChange('UP', 'UP')).toBe(true))
  it('allows same direction (LEFT → LEFT)', () => expect(isValidDirectionChange('LEFT', 'LEFT')).toBe(true))
})
