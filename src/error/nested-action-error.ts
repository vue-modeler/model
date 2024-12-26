export class NestedActionError extends Error {
  constructor (
    protected actionName: string,
    protected options: { cause: Error },
  ) {
    super(`Action ${actionName} throw error`)

    this.name = this.constructor.name
  }

  for (action: (...args: any[]) => Promise<void>): boolean {
    return action.name === this.actionName
  }

  get cause (): Error {
    return this.options.cause
  }
}
