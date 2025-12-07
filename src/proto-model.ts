import { computed, ComputedGetter, ComputedRef, DebuggerOptions, effectScope, Ref, ref, watch, watchEffect, WatchStopHandle } from 'vue'

import { Action, ActionLike } from './action'
import { createModel } from './create-model'
import { ActionInternalError } from './error'
import { ActionStateName, Model, OriginalMethod, OriginalMethodWrapper } from './types'


type ModelConstructor<T extends ProtoModel> = new (...args: any[]) => T

// use symbols to avoid name collisions in prototype chain
const scopeKey = Symbol('scope')
const modelKey = Symbol('model')
const actionsKey = Symbol('actions')
const actionIdsKey = Symbol('actionIds')
const actionStatesKey = Symbol('actionStates')
const actionsSizeKey = Symbol('actionsSize')
const watchStopHandlersKey = Symbol('watchStopHandlers')

export abstract class ProtoModel {
  // each model has its own effect scope to avoid memory leaks
  protected [scopeKey] = effectScope(true)
  protected [modelKey]: Model<this> | null = null
  // we use WeakMap to store actions as keys to avoid memory leaks
  protected [actionsKey] = new WeakMap<OriginalMethodWrapper, ActionLike<this>>()
  protected [actionIdsKey] = new WeakMap<ActionLike<this>, number>()
  protected [actionStatesKey] = new Map<ActionStateName, Ref<number>>()
  // WeakMap doesn't have a size property, so we need to store the size of the map
  protected [actionsSizeKey] = 0

  // watchers are stored in a set to avoid memory leaks
  protected [watchStopHandlersKey] = new Set<ReturnType<typeof watch>>()

  protected static createModel = createModel
  /**
   * Creates a model instance.
   * 
   * @param args - arguments for the model constructor.
   * @returns model instance.
   * @see src/create-model.ts
   */
  static model<T extends ProtoModel, Args extends unknown[]>(
    this: new (...args: Args) => T,
    ...args: Args
  ): Model<T> {
    if (this.prototype === ProtoModel.prototype) {
      throw new Error('ProtoModel is abstract class and can not be instantiated')
    }

    const protoModel = new this(...args)
    const model = ProtoModel.createModel(protoModel)

    protoModel[modelKey] = model
    return model
  }
  
  get hasPendingActions (): boolean {
    return !!this.getActionStatesRef(Action.possibleState.pending).value
  }

  get hasActionWithError (): boolean {
    return !!this.getActionStatesRef(Action.possibleState.error).value
  }

  /**
   * Registers watcher in the model effect scope.
   * It uses "watch" or "watchEffect" function from Vue.
   *
   * It has restrictions. It can't be used with own not reactive properties.
   * This is because `this` in inner context is not shallow reactive.
   * 
   * Example with error:
   * 
   * ```ts
   * class TestModel extends ProtoModel {
   *   protected _someProperty: string = ''
   *   
   *   constructor () {
   *     super()
   *     
   *     // This watcher will not work because 
   *     // `this` and `this.someProperty`
   *     // are not reactive
   *     this.watch(
   *       () => this.someProperty, 
   *       (value: string) => {
   *         console.log(value)
   *       }
   *     )
   *   }
   * 
   *   get someProperty(): string { 
   *     return this._someProperty
   *   }
   * }
   * 
   * To watch for own properties you need to define it as reactive property
   * with ref or this.computed.
   * 
   * ```ts
   * class TestModel extends ProtoModel {
   *   protected _someProperty = ref('')
   *   
   *   constructor () {
   *     super()
   * 
   *     // This watcher will work because `this._someProperty` is reactive
   *     this.watch(
   *       () => this._someProperty.value, 
   *       (value: string) => {
   *         console.log(value)
   *       }
   *     )
   *   }
   * }
   * ```
   * 
   * @param args - arguments for "watch" or "watchEffect" function.
   * @see src/create-model.ts
   */
  protected watch (...args: unknown[]): WatchStopHandle {
    if (args.length === 0) {
      throw new Error('watch requires at least one argument')
    }

    const watchStopHandler = (args.length === 1)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      ? this[scopeKey].run(() => watchEffect(args[0]))
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      : this[scopeKey].run(() => watch(...args))
      
    if (!watchStopHandler) {
      throw new Error('watchStopHandler is undefined')
    }

    this[watchStopHandlersKey].add(watchStopHandler)

    return () => {
      watchStopHandler()
      this[watchStopHandlersKey].delete(watchStopHandler)  
    }
  }

  protected computed<T> (getter: ComputedGetter<T>, debugOptions?: DebuggerOptions): ComputedRef<T> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    return this[scopeKey].run(() => computed(getter, debugOptions))
  }

  // @see https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/math/bits/updateBit.js
  protected updateBit (number: number, bitPosition: number, bitValue: boolean): number {
    // Normalized bit value.
    const bitValueNormalized = bitValue
      ? 1
      : 0

    const clearMask = ~(1 << bitPosition)

    return (number & clearMask) | (bitValueNormalized << bitPosition)
  }


  protected createAction (actionFunction: OriginalMethodWrapper): ActionLike<this> {
    const modelGetter = () => {
      if (!this[modelKey]) {
        throw new Error('Model not set')
      }

      return this[modelKey]
    }

    const action = Action.create<this>(
      this,
      actionFunction,
      modelGetter,
      this.setActionState.bind(this),
    )

    this[actionsKey].set(actionFunction, action)
    this[actionIdsKey].set(action, ++this[actionsSizeKey])
    this.setActionState(action)
    
    return action
  }

  protected getActionStatesRef(stateName: ActionStateName): Ref<number> {
    const refToStateFlag = this[actionStatesKey].get(stateName) || ref(0)
    if (this[actionStatesKey].get(stateName) === undefined) {
      this[actionStatesKey].set(stateName, refToStateFlag)
    }

    return refToStateFlag
  }

  /**
   * Gets Action instance by wrapped original method or create Action instance.
   * 
   * From external context of model this method is implicitly used to get or create an action.
   * It called inside get hook proxy of action.
   * @see src/create-model.ts
   * 
   * ```ts
   * class TestModel extends ProtoModel {
   *   @action async testAction(): Promise<void> {
   *     return Promise.resolve()
   *   }
   * }
   * // hook catches 'testAction' property getting and call 'action' method 
   * const result = testModel.testAction.exec()
   * ```
   * 
   * In internal context of model this method is used to get Action instance.
   * You can`t call it as `testModel.testAction.exec()` or `testModel.testAction.isPending` etc.
   * because TypeScript sees it as standard method of the class and you will get error about type.
   * 
   * To get Action instance in internal context of model
   * you need to call it as `testModel.action(testModel.testAction)`
   *
   * ```ts
   * class TestModel extends ProtoModel {
   *   @action async testAction(): Promise<void> {
   *     return Promise.resolve()
   *   }
   *   async otherAction(): Promise<void> {
   *     ...
   *     if (this.action(this.testAction).isPending) {
   *       console.log('testAction is pending')
   *     }
   *     ...
   *   }
   * }
   * ```
   * This is reason why  the argument is defined as OriginalMethod | OriginalMethodWrapper.
   * 
   * @param originalMethod - defined as OriginalMethod or OriginalMethodWrapper.
   * @returns action
  */
  protected action (originalMethod: OriginalMethod | OriginalMethodWrapper): ActionLike<this> {
    const isActionDecoratorApplied = Action.actionFlag in originalMethod
      && typeof originalMethod[Action.actionFlag] === 'function'

    if (!isActionDecoratorApplied) {
      throw new ActionInternalError('Action decorator is not applied to the method')
    }

    return this[actionsKey].get(originalMethod) || this.createAction(originalMethod)
  }

  /**
   * It is public method in context ProtoModel,
   * but in Model<ProtoModel> context it is protected method
   * 
   * @see type Model<T>
   */
  setActionState(action: ActionLike<this>): void {
    const actionId = this[actionIdsKey].get(action)

    if (!actionId) {
      throw new Error('Action not found')
    }

    for (const stateName of action.possibleStates) {
      if (stateName === action.state) {
        continue
      }

      this.getActionStatesRef(stateName).value = this.updateBit(this.getActionStatesRef(stateName).value, actionId, false)
    }

    this.getActionStatesRef(action.state).value = this.updateBit(this.getActionStatesRef(action.state).value, actionId, true)
  }

  isModelOf<T extends ProtoModel> (typeModel: ModelConstructor<T>): boolean {
    return this instanceof typeModel
  }

  destructor (): void {
    this[watchStopHandlersKey].forEach((stopHandler) => { stopHandler() })
    this[watchStopHandlersKey] = new Set()

    this[scopeKey].stop()
  }
}
