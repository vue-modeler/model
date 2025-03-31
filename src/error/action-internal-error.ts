/**
 * IMPORTANT: this class is an error in the correct terminology "errors vs exceptions".
 * 
 * In other words, this is a class of errors that must not be handled
 * and should be visible in console.
 * 
 * These are errors made in logic made during development
 */
export class ActionInternalError extends Error {
  constructor (
    public message: string,
    protected options?: { cause: Error },
  ) {
    super(message, options)
    this.name = this.constructor.name
  }
}
