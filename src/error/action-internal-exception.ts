export class ActionInternalException extends Error {
  constructor (
    public message: string,
    protected options?: { cause: Error },
  ) {
    super(message, options)
    this.name = this.constructor.name
  }
}
