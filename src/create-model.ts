
import { shallowReactive } from 'vue'
import { Action } from './action'
import { ProtoModel } from './proto-model'
import { OriginalMethodWrapper, Model, ModelAdapterProxyConstructor } from './types'

// eslint-disable-next-line @typescript-eslint/naming-convention
const ModelProxy = Proxy as ModelAdapterProxyConstructor

export function createModel<Target extends ProtoModel> (
  protoModel: Target,
): Model<Target> {
  if (!(protoModel instanceof ProtoModel)) {
    throw new Error('ProtoModel instance is required')
  }

  const model = new ModelProxy<Target>(
    shallowReactive(protoModel),
    {
      get (target, propName, receiver): unknown {
        const targetProperty = Reflect.get(target, propName, receiver)

        const targetPropertyIsFunction = typeof targetProperty === 'function'
        const targetPropertyIsAction =  targetPropertyIsFunction
          && Action.actionFlag in targetProperty
          && typeof targetProperty[Action.actionFlag] === 'function'

        if (targetPropertyIsAction) {
          return target.action(targetProperty as OriginalMethodWrapper)
        }

        if (targetPropertyIsFunction) {
          // ** IMPORTANT **
          // Here, the "target" is the original instance without the proxy applied. 
          // We need to bind "target" to the method in order
          // to keep "this" equal to target inside the method. 
          //
          // Otherwise, "this" will be equal to proxy object, so 
          // "this.someAction" will invoke get trap from proxy and
          // return Action instance instead of original method.
          // Then "this.action(this.someAction)" will throw an error "Action not found".
          // because "this.action" requires method as argument, not Action instance.
          return targetProperty.bind(target)
          
          // Example with error, if we will not bind "target" to the property:
          // 
          // class TestProtoModel extends ProtoModel {
          //   @action async someAction(): Promise<void> {
          //     ...
          //   }
          //
          //   @action async otherAction() {
          //     ...
          //     // first of all this line will throw typescript error
          //     // because in the class context "this.someAction" is method, not action
          //     this.someAction.exec() 
          //     
          //     // So, to invoke action or get his state
          //     // we need to get action as object.
          //     // But any of lines below will throw error "Action not found"
          //     // because "this" inside property will be equal proxy object
          //     // and "this.someAction" will be equal to Action instance
          //     this.action(this.someAction).exec()
          //     const error = this.action(this.someAction).error
          //   }
          // }
        }

        return targetProperty
      },
    },
  )

  return model
}
