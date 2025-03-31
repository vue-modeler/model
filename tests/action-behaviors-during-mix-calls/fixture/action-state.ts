import { Action } from '../../../src/action'

const pending = Action.possibleState.pending
const error = Action.possibleState.error
const ready = Action.possibleState.ready
const lock = Action.possibleState.lock
const abort = Action.possibleState.abort

export const singleSuccessAction = [
  { state: pending },
  { state: ready },
]
export const singleErrorAction = [
  { state: pending },
  { state: error },
]

export const nestedWithAbort = [
  {
    root: pending,
    nested: pending,
  },
  {
    root: pending,
    nested: abort,
  },
  {
    root: ready,
    nested: abort,
  },
]
export const nestedWithAbortAll = [
  {
    root: pending,
    nested: pending,
  },
  {
    root: pending,
    nested: abort,
  },
  {
    root: ready,
    nested: abort,
  },
]

export const nestedWithLock = [
  {
    root: pending,
    nested: pending,
  },
  {
    root: pending,
    nested: lock,
  },
  {
    root: ready,
    nested: lock,
  },
]

export const actionSuccessWithTwoNested = [
  {
    root: pending,
    nestedA: pending,
    nestedB: ready,
  },
  {
    root: pending,
    nestedA: ready,
    nestedB: ready,
  },
  {
    root: pending,
    nestedA: ready,
    nestedB: pending,
  },
  {
    root: pending,
    nestedA: ready,
    nestedB: ready,
  },
  {
    root: ready,
    nestedA: ready,
    nestedB: ready,
  },
]

export const actionErrorWithTwoNested = [
  {
    root: pending,
    nestedA: pending,
    nestedB: ready,
  },
  {
    root: pending,
    nestedA: ready,
    nestedB: ready,
  },
  {
    root: pending,
    nestedA: ready,
    nestedB: pending,
  },
  {
    root: pending,
    nestedA: ready,
    nestedB: error,
  },
  {
    root: ready,
    nestedA: ready,
    nestedB: error,
  },
]

export const actionStatesForParallel = [
  {
    nestedA: pending,
    nestedB: pending,
  },
  {
    nestedA: ready,
    nestedB: ready,
  },
]

export const actionStatesCaseWithErrorInSubAction = [
  {
    root: true,
    subAction: true,
  },
  {
    root: true,
    subAction: false,
  },
  {
    root: false,
    subAction: false,
  },
]
