
import { Action } from './action'
import { ProtoModel } from './proto-model'
import { ActionFunction, Model, ModelAdapterProxyConstructor } from './types'

// eslint-disable-next-line @typescript-eslint/naming-convention
const ModelProxy = Proxy as ModelAdapterProxyConstructor

export function createModel<Target extends ProtoModel> (
  model: Target,
): Model<Target> {
  const asyncModel = new ModelProxy<Target>(
    model,
    {
      get (target, propName, receiver): unknown {
        const targetProperty = Reflect.get(target, propName, receiver)

        const targetPropertyIsFunction = typeof targetProperty === 'function'
        const targetPropertyIsAction = targetPropertyIsFunction
          && Action.actionFlag in targetProperty
          && typeof targetProperty[Action.actionFlag] === 'function'

        if (targetPropertyIsAction) {
          return target.action(targetProperty as ActionFunction)
        }

        if (targetPropertyIsFunction) {
          // TODO: написать тест на это
          // this будет равен proxy обьекту без привязки контекста внутри методов.
          // Из-за этого обращение this.someAction будет возвращать action,
          // Код типа this.action(this.someAction)... будет вызывать ошибку "Не найден action",
          // потому что аргументом передается action, а нужен исходный метод
          // Использовать this.someAction как action внутри класса не дааст TypeScript
          //
          // Т.е. нам нужно, что бы внутри объекта this.someAction был исходным методом.
          // поэтому делаем привязку контекста this

          return targetProperty.bind(target)
        }

        return targetProperty
      },
    },
  )

  return asyncModel
}
