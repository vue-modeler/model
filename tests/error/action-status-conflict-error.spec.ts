import { describe, expect, test } from 'vitest'
import { ActionStatusConflictError } from '../../src/error/action-status-conflict-error'
import { Action } from '../../src/action'

describe('ActionStatusConflictError', () => {
  test('creates error with correct message format', () => {
    const actionName = 'testAction'
    const fromStatus = Action.possibleState.ready
    const toStatus = Action.possibleState.pending
    const error = new ActionStatusConflictError(actionName, fromStatus, toStatus)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ActionStatusConflictError)
    expect(error.name).toBe('ActionStatusConflictError')
    expect(error.message).toBe('Trying to update state of testAction from ready to pending')
  })
  
}) 