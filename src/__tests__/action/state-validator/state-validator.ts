import { expect } from '@playwright/test'

import { Action } from '../../../action'
import { ActionPublic } from '../../../types'

export function validateLockState (action: ActionPublic): void {
  expect(action.isLock).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.asError).toBeNull()
}

export function validateErrorState (action: Action, error: Error): void {
  expect(action.isError).toBeTruthy()

  expect(action.asError).toBeInstanceOf(Error)
  expect(action.asError?.message).toBe(error.message)
  expect(action.asAbortController).toBeNull()
  expect(action.asReason).toBeNull()
}

export function validatePendingState (action: Action): void {
  expect(action.isPending).toBeTruthy()
  expect(action.asAbortController).toBeInstanceOf(AbortController)
}

export function validateReadyState (action: Action): void {
  expect(action.isReady).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.asError).toBeNull()
}

export function validateAbortState (action: Action, reason: unknown): void {
  expect(action.isAbort).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.asError).toBeNull()
  expect(action.asReason).toBe(reason)
}

