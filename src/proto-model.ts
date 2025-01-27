import { computed, ComputedGetter, ComputedRef, DebuggerOptions, effectScope, Ref, ref, ShallowReactive, shallowReactive, watch, WatchStopHandle } from 'vue'

import { Action } from './action'
import { ActionPublic, ActionStateName, OriginalMethodWrapper } from './types'


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

  protected stopWatching (stopHandler: WatchStopHandle):void {
    if (this._unwatchers.has(stopHandler)) {
      this._unwatchers.delete(stopHandler)
    }

    stopHandler()
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

  hasActionInState(state: ActionStateName): boolean {
    return !!this.getActionStatesRef(state).value
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

  /**
  * This is an open method, but you won't be able to call it from outside the model
  * because its argument is "OriginalMethodWrapper".
  * "OriginalMethodWrapper" is not accessible from the outside,
  * because the model is wrapped in a proxy and
  * the "get" trap will always return an "Action" instead of "OriginalMethodWrapper".
  * 
  * @param originalMethod - method to create action for
  * @returns action
  */
  action (originalMethod: OriginalMethodWrapper): ShallowReactive<ActionPublic> {
    return this._actions.get(originalMethod) || this.createAction(originalMethod)
  }

  destructor (): void {
    this._unwatchers.forEach((unwatcher) => { unwatcher() })
    this._unwatchers = new Set()

    this._effectScope.stop()
  }
}
