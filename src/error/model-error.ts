import { Action } from '../action'
import { ActionError } from './action-error'

export class ModelError extends AggregateError {
  constructor (errors: ActionError[]) {
    super(errors)

    this.name = this.constructor.name
  }

  forAny (actions: Action[]): Error | undefined {
    return (this.errors as ActionError[]).find(
      (error: ActionError) => actions.find(
        (action) => error.for(action),
      ),
    )
  }
}
