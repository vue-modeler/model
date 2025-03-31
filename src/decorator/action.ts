import { Action } from '../action'
import { ProtoModel } from '../proto-model'
import { OriginalMethodWrapper, OriginalMethod } from '../types'

export const action: MethodDecorator = (
  target: unknown,
  actionName: string | symbol,
  descriptor: PropertyDescriptor,
): void => {
  if (typeof actionName !== 'string') {
    throw new Error('Action name is not a string')
  }

  if (typeof descriptor.value !== 'function') {
    throw new Error('Property value is not a function')
  }

  if (!(target instanceof ProtoModel)) {
    throw new Error('Target is not instance of ProtoModel')
  }

  const originalMethod = descriptor.value as OriginalMethod
  
  const stubObj = {
    // Action constructor checks that model has method with the same name.
    // We can`t define anonymous function and change name because Function.name is readonly property.
    // So we need to create stub object to save original method name
    [actionName]: function (this: ProtoModel, ...args: any[]): Promise<void> {
      // this.action(stubObj[actionName]) will create action with "actionName" inside instance.
      // It is very important to use stubObj[actionName] as argument.
      // It lets automatically convert internal call this.actionName() to this.action(this.actionName).exec() 
      // **IMPORTANT**
      // This code will be executed only for internal calls (this.actionName()). 
      // For external calls (model.actionName()) will be executed Proxy handler. @see createModel
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return this.action(stubObj[actionName]).exec(...args)
    } as OriginalMethodWrapper
  } 

  // save original method. It will be used inside Action.exec
  // @see Action.exec
  stubObj[actionName][Action.actionFlag] = originalMethod

  descriptor.value = stubObj[actionName]
}
