import { Action } from '../action'
import { ProtoModel } from '../proto-model'

export const action: MethodDecorator = (
  target: unknown,
  actionName: string,
  descriptor: PropertyDescriptor,
) => {
  descriptor.value[Action.actionFlag] = true
  const originalMethod = descriptor.value

  if (!(target instanceof ProtoModel)) {
    throw new Error('Target is not instance of ProtoModel')
  }

  // выглядит так, что этот код нужен, только для того что бы внутри модели
  // была возможность вызвать action
  // как метод модели, а не как action.exec
  // model.someAction(...) вместо model.action(model.someAction).exec(...)
  //
  // Снаружи модели асинхронный метод доступен только как action
  // и его можно и нужно вызывать только как model.someAction.exec(...)
  // Это обеспечивается тем, что в proxy при обращении к методу, если он помечен декоратором @action
  // возвращается action, а не метод.
  //
  // Если всегда все action внутри модели вызывать как model.action(model.someAction).exec(...)
  // то возможно stubObj и не нужен.
  // Достаточно только установить Action.actionFlag
  // @todo:Возможно, это нужно будет переписать
  const stubObj = {
    [actionName]: function (...args: any[]): Promise<void> {
      return (this.action(stubObj[actionName]) as Action).exec(...args)
    },
  }
  stubObj[actionName][Action.actionFlag] = originalMethod

  descriptor.value = stubObj[actionName]
}
