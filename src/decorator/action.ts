import { Action } from '../action'
import { ProtoModel } from '../proto-model'
import { OriginalMethodWrapper } from '../types'


export function action<T extends ProtoModel, Args extends unknown[]>(
  originalMethod: (this: T, ...args: Args) => Promise<void>,
  context: ClassMethodDecoratorContext<T, (this: T, ...args: Args) => Promise<void>>
): OriginalMethodWrapper<Args> {
  if (context.static) {
    throw new Error('Action decorator is not supported for static methods')
  }

  if (context.private) {
    throw new Error('Action decorator is not supported for private methods')
  }

  let name: string
  try {
    name = context.name.toString()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'unknown error'

    const message = `Invalid context. Can\`t get name of the method: ${errorMessage}`
        
    throw new Error(message)
  }
  
  const stubObj = {
    // Action constructor checks that model has method with the same name.
    // We can`t define anonymous function and change name because Function.name is readonly property.
    // So we need to create stub object to save original method name
    [name]: function (this: T, ...args: Args): Promise<void> {
      // this.action(stubObj[actionName]) will create action with "actionName" inside instance.
      // It is very important to use stubObj[actionName] as argument.
      // It lets automatically convert internal call this.actionName() to this.action(this.actionName).exec() 
      // **IMPORTANT**
      // This code will be executed only for internal calls (this.actionName()). 
      // For external calls (model.actionName()) will be executed Proxy handler.
      // @see src/create-model.ts
      return this.action(stubObj[name]).exec(...args)
    } as OriginalMethodWrapper
  } 

  // save original method. It will be used inside Action.exec
  // @see Action.exec
  stubObj[name][Action.actionFlag] = originalMethod

  return stubObj[name]
}
