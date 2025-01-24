import { expect } from 'vitest'
import { ActionPublic } from '../../../src/types'

export function validateLockState (action: ActionPublic): void {
  expect(action.isLock).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.error).toBeNull()
}

export function validateErrorState (action: ActionPublic, error: Error): void {
  expect(action.isError).toBeTruthy()

  expect(action.error).toBeInstanceOf(Error)
  expect(action.error?.message).toBe(error.message)
  expect(action.asAbortController).toBeNull()
  expect(action.asReason).toBeNull()
}

export function validatePendingState (action: ActionPublic): void {
  expect(action.isPending).toBeTruthy()
  expect(action.asAbortController).toBeInstanceOf(AbortController)
}

export function validateReadyState (action: ActionPublic): void {
  expect(action.isReady).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.error).toBeNull()
}

export function validateAbortState (action: ActionPublic, reason: unknown): void {
  expect(action.isAbort).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.error).toBeNull()
  expect(action.asReason).toBe(reason)
}



