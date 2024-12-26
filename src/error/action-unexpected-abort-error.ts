import { ActionStateName } from '../types'
import { ActionInternalException } from './action-internal-exception'

export class ActionUnexpectedAbortError extends ActionInternalException {
  constructor (actionName: string, currentState: ActionStateName) {
    super(`Unexpected AbortError for the action ${actionName} in state ${currentState}`)

    this.name = this.constructor.name
  }
}
