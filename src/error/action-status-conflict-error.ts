import { ActionStateName } from '../types'
import { ActionInternalError } from './action-internal-error'

export class ActionStatusConflictError extends ActionInternalError {
  constructor (actionName: string, currentState: ActionStateName, newState: ActionStateName) {
    super(`Trying to update state of ${actionName} from ${currentState} to ${newState}`)

    this.name = this.constructor.name
  }
}
