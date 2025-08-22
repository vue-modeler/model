import { computed, ComputedGetter, ComputedRef, DebuggerOptions, effectScope, Ref, ref, ShallowReactive, shallowReactive, watch, WatchStopHandle } from 'vue'

import { Action } from './action'
import { ActionPublic, ActionStateName, Model, OriginalMethod, OriginalMethodWrapper } from './types'
import { ActionInternalError } from './error'
import { createModel } from './create-model'


type ModelConstructor = new (...args: any[]) => ProtoModel

export abstract class ProtoModel {
  // each model has its own effect scope to avoid memory leaks
  protected _effectScope = effectScope(true)

  // we use WeakMap to store actions as keys to avoid memory leaks
  protected _actions = new WeakMap<OriginalMethodWrapper, ShallowReactive<ActionPublic>>()
  protected _actionIds = new WeakMap<ShallowReactive<ActionPublic>, number>()
  protected _actionStates = new Map<ActionStateName, Ref<number>>()
  // WeakMap doesn't have a size property, so we need to store the size of the map
  protected _actionsSize = 0

  // watchers are stored in a set to avoid memory leaks
  protected _unwatchers = new Set<ReturnType<typeof watch>>()

  static model<T extends ProtoModel, Args extends unknown[]>(
    this: new (...args: Args) => T,
    ...args: Args
  ): Model<T> {
    if (this.prototype === ProtoModel.prototype) {
      throw new Error('ProtoModel is abstract class and can not be instantiated')
    }

    const protoModel = new this(...args)

    return createModel(protoModel)
  }
  
  get hasPendingActions (): boolean {
    return !!this.getActionStatesRef(Action.possibleState.pending).value
  }

  get hasActionWithError (): boolean {
    return !!this.getActionStatesRef(Action.possibleState.error).value
  }

  protected watch (...args: unknown[]): WatchStopHandle {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    const watchStopHandler = this._effectScope.run(() => watch(...args))

    if (!watchStopHandler) {
      throw new Error('watchStopHandler is undefined')
    }

    this._unwatchers.add(watchStopHandler)

    return watchStopHandler
  }

  protected computed<T> (getter: ComputedGetter<T>, debugOptions?: DebuggerOptions): ComputedRef<T> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    return this._effectScope.run(() => computed(getter, debugOptions))
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


  protected createAction (actionFunction: OriginalMethodWrapper): ShallowReactive<ActionPublic> {
    const action = shallowReactive(new Action(this, actionFunction))

    this._actions.set(actionFunction, action)
    this._actionIds.set(action, ++this._actionsSize)
    this.setActionState(action)
    
    return action
  }

  protected getActionStatesRef(stateName: ActionStateName): Ref<number> {
    const refToStateFlag = this._actionStates.get(stateName) || ref(0)
    if (this._actionStates.get(stateName) === undefined) {
      this._actionStates.set(stateName, refToStateFlag)
    }

    return refToStateFlag
  }

  /**
   * Gets Action instance by wrapped original method or create Action instance.
   * 
   * From external context of model this method is implicitly used to get or create an action.
   * It called inside get hook proxy of action.
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
   * because TypeScript sees it as  standard  method of model instance and you will get error about type.
   * 
   * To get Action instance in internal context of model you need to call it as `testModel.action(testModel.testAction)`
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
  protected action (originalMethod: OriginalMethod | OriginalMethodWrapper): ShallowReactive<ActionPublic> {
    const isActionDecoratorApplied = Action.actionFlag in originalMethod
      && typeof originalMethod[Action.actionFlag] === 'function'

    if (!isActionDecoratorApplied) {
      throw new ActionInternalError('Action decorator is not applied to the method')
    }

    return this._actions.get(originalMethod) || this.createAction(originalMethod)
  }

  /**
   * It is public method in context ProtoModel,
   * but in Model<ProtoModel> context it is protected method
   * 
   * @see type Model<T>
   */
  setActionState(action: Action): void {
    const actionId = this._actionIds.get(action)

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

  isModelOf (typeModel: ModelConstructor): boolean {
    return this instanceof typeModel
  }

  destructor (): void {
    this._unwatchers.forEach((unwatcher) => { unwatcher() })
    this._unwatchers = new Set()

    this._effectScope.stop()
  }
}
