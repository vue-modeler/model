import { Action } from '../action'

export class ActionError extends Error {
  constructor (
    protected actionName: string,
    protected options: { cause: Error },
  ) {
    super(`Action ${actionName} throw error`)

    this.name = this.constructor.name
  }

  for (action: Action): boolean {
    return action.name === this.actionName
  }

  throwCause (): void {
    throw this.cause
  }

  get cause (): Error {
    return this.options.cause
  }

  get message () : string {
    return this.toString()
  }

  toString (): string {
    return this.options.cause.message
  }
}
