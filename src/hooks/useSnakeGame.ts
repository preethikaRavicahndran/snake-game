import { useCallback, useEffect, useRef, useState } from 'react'
import {
  moveSnake,
  checkWallCollision,
  checkSelfCollision,
  generateFoodPosition,
  isValidDirectionChange,
} from '../engine/gameLogic'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TICK_MS,
  POINTS_PER_FOOD,
  INITIAL_SNAKE,
  INITIAL_DIRECTION,
} from '../engine/types'
import type { Direction, GameState, Position } from '../engine/types'

const HIGH_SCORE_KEY = 'snake_high_score'

function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) ?? '0', 10) || 0
  } catch {
    return 0
  }
}

function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export interface SnakeGameState {
  snake: Position[]
  food: Position
  score: number
  highScore: number
  gameState: GameState
  direction: Direction
}

export interface SnakeGameActions {
  start: () => void
  pause: () => void
  resume: () => void
  changeDirection: (dir: Direction) => void
}

export function useSnakeGame(): SnakeGameState & SnakeGameActions {
  const initialFood = generateFoodPosition(INITIAL_SNAKE, GRID_WIDTH, GRID_HEIGHT)

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>(initialFood)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(loadHighScore)
  const [gameState, setGameState] = useState<GameState>('IDLE')
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)

  // Refs hold the most current mutable values for use inside the interval
  // callback without stale-closure issues.
  const snakeRef = useRef(snake)
  const foodRef = useRef(food)
  const scoreRef = useRef(score)
  const directionRef = useRef(direction)
  // Buffer the next requested direction; applied on next tick to prevent
  // multiple key-presses within a single tick from causing a reversal.
  const pendingDir = useRef<Direction>(direction)

  snakeRef.current = snake
  foodRef.current = food
  scoreRef.current = score
  directionRef.current = direction

  const tick = useCallback(() => {
    const currentSnake = snakeRef.current
    const currentFood = foodRef.current
    const currentScore = scoreRef.current

    // Apply buffered direction (validated before buffering)
    const nextDir = pendingDir.current
    directionRef.current = nextDir

    const head = currentSnake[0]

    // Compute new head without yet constructing the full array.
    const newHeadX =
      nextDir === 'LEFT' ? head.x - 1 : nextDir === 'RIGHT' ? head.x + 1 : head.x
    const newHeadY =
      nextDir === 'UP' ? head.y - 1 : nextDir === 'DOWN' ? head.y + 1 : head.y
    const newHead: Position = { x: newHeadX, y: newHeadY }

    // Collision checks before constructing state
    if (checkWallCollision(newHead, GRID_WIDTH, GRID_HEIGHT)) {
      setGameState('GAMEOVER')
      return
    }

    // Self-collision: check against the entire snake except the last segment
    // (which will shift away when not growing).
    const bodyToCheck = currentSnake.slice(0, currentSnake.length - 1)
    if (checkSelfCollision(newHead, bodyToCheck)) {
      setGameState('GAMEOVER')
      return
    }

    const ateFood = newHead.x === currentFood.x && newHead.y === currentFood.y
    const newSnake = moveSnake(currentSnake, nextDir, ateFood)

    if (ateFood) {
      const newScore = currentScore + POINTS_PER_FOOD
      const storedHigh = loadHighScore()
      if (newScore > storedHigh) {
        saveHighScore(newScore)
        setHighScore(newScore)
      }
      setScore(newScore)
      setFood(generateFoodPosition(newSnake, GRID_WIDTH, GRID_HEIGHT))
    }

    setSnake(newSnake)
    setDirection(nextDir)
  }, [])

  // Game loop interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startLoop = useCallback(() => {
    clearLoop()
    intervalRef.current = setInterval(tick, TICK_MS)
  }, [tick, clearLoop])

  useEffect(() => {
    if (gameState === 'PLAYING') {
      startLoop()
    } else {
      clearLoop()
    }
    return clearLoop
  }, [gameState, startLoop, clearLoop])

  // ── Actions ──────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    const fresh = [...INITIAL_SNAKE]
    const freshFood = generateFoodPosition(fresh, GRID_WIDTH, GRID_HEIGHT)
    setSnake(fresh)
    setFood(freshFood)
    setScore(0)
    setDirection(INITIAL_DIRECTION)
    pendingDir.current = INITIAL_DIRECTION
    setHighScore(loadHighScore())
    setGameState('PLAYING')
  }, [])

  const pause = useCallback(() => {
    setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev))
  }, [])

  const resume = useCallback(() => {
    setGameState((prev) => (prev === 'PAUSED' ? 'PLAYING' : prev))
  }, [])

  const changeDirection = useCallback((dir: Direction) => {
    if (isValidDirectionChange(directionRef.current, dir)) {
      pendingDir.current = dir
    }
  }, [])

  // ── Keyboard controls ────────────────────────────────────────────────────

  useEffect(() => {
    const KEY_MAP: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      W: 'UP',
      s: 'DOWN',
      S: 'DOWN',
      a: 'LEFT',
      A: 'LEFT',
      d: 'RIGHT',
      D: 'RIGHT',
    }

    const handleKey = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key]
      if (dir) {
        e.preventDefault()
        changeDirection(dir)
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') pause()
        else if (gameState === 'PAUSED') resume()
      }
      if ((e.key === 'Enter' || e.key === ' ') && gameState === 'IDLE') {
        start()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState, changeDirection, pause, resume, start])

  return {
    snake,
    food,
    score,
    highScore,
    gameState,
    direction,
    start,
    pause,
    resume,
    changeDirection,
  }
}
