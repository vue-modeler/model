import { shallowReactive } from 'vue'

/**
 * @deprecated
 */
export const model: ClassDecorator = (targetClass) => new Proxy(targetClass, {
  // proxy for constructor can`t change inreface of targetClass
  construct (targetClass, args: unknown[]): object {
    const instanceProtoModel = Reflect.construct(targetClass, args)
    const model = shallowReactive(instanceProtoModel)

    if (typeof model.afterConstructor === 'function') {
      model.afterConstructor()
    }

    return model
  },
})

