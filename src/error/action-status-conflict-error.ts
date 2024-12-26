import { ActionStateName } from '../types'
import { ActionInternalException } from './action-internal-exception'

export class ActionStatusConflictError extends ActionInternalException {
  constructor (actionName: string, currentState: ActionStateName, newState: ActionStateName) {
    super(`Trying to update state of ${actionName} from ${currentState} to ${newState}`)

    this.name = this.constructor.name
  }
}
