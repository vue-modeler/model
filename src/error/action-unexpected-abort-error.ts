import { ActionStateName } from '../types'
import { ActionInternalError } from './action-internal-error'

export class ActionUnexpectedAbortError extends ActionInternalError {
  constructor (actionName: string, currentState: ActionStateName) {
    super(`Unexpected AbortError for the action ${actionName} in state ${currentState}`)

    this.name = this.constructor.name
  }
}
