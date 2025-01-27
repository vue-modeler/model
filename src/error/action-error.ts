/**
 * IMPORTANT: this class looks like error,
 * but it is an exception in the correct terminology "errors vs exceptions".
 * 
 * In other words, this is a class of errors that must be handled
 * and displayed to the user as messages in UI layer.
 */
export class ActionError extends Error {
  constructor (
    protected actionName: string,
    protected options: { cause: Error },
  ) {
    super(`Action ${actionName} throw error`)

    this.name = this.constructor.name
  }

  get cause (): Error {
    return this.options.cause
  }
  
  get message () : string {
    return this.toString()
  }
  
  throwCause (): void {
    throw this.cause
  }

  toString (): string {
    return this.options.cause.message
  }
}
