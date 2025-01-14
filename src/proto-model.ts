import { computed, ComputedGetter, ComputedRef, DebuggerOptions, effectScope, ref, ShallowReactive, shallowReactive, ShallowRef, shallowRef, watch, WatchStopHandle } from 'vue'

import { ModelError } from './error/model-error'
import { Action } from './action'
import { OriginalMethodWrapper, ActionPublic } from './types'

// @see https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/math/bits/updateBit.js
const updateBit = (number: number, bitPosition: number, bitValue: boolean): number => {
  // Normalized bit value.
  const bitValueNormalized = bitValue
    ? 1
    : 0

  // eslint-disable-next-line no-bitwise
  const clearMask = ~(1 << bitPosition)

  // eslint-disable-next-line no-bitwise
  return (number & clearMask) | (bitValueNormalized << bitPosition)
}

type ModelConstructor = new (...args: any[]) => ProtoModel

export abstract class ProtoModel {
  // @deprecated
  protected _error = shallowRef<ModelError | null>(null)
  // each model has its own effect scope to avoid memory leaks
  protected _effectScope = effectScope(true)

  // we use WeakMap to store actions as keys to avoid memory leaks
  protected _actions = new WeakMap<OriginalMethodWrapper, Action>()
  // WeakMap doesn't have a size property, so we need to store the size of the map
  protected _actionsSize = 0

  // watchers are stored in a set to avoid memory leaks
  protected _unwatchers = new Set<ReturnType<typeof watch>>()

  // it is flag to check if any action is pending state
  protected _hasPendingActions = ref(0)
  // it is flag to check if any action is error state
  protected _hasActionWithError = ref(0)

  // @deprecated
  get error (): ShallowRef<ModelError | null> {
    return this._error
  }

  get hasPendingActions (): boolean {
    return !!this._hasPendingActions.value
  }

  get hasActionWithError (): boolean {
    return !!this._hasActionWithError.value
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

  protected updateBit (number: number, bitPosition: number, bitValue: boolean): number {
    // Normalized bit value.
    const bitValueNormalized = bitValue
      ? 1
      : 0
    // eslint-disable-next-line no-bitwise
    const clearMask = ~(1 << bitPosition)

    // eslint-disable-next-line no-bitwise
    return (number & clearMask) | (bitValueNormalized << bitPosition)
  }

  protected createAction (actionFunction: OriginalMethodWrapper): ShallowReactive<ActionPublic> {
    const action = shallowReactive(new Action(this, actionFunction))

    this._actions.set(actionFunction, action)
    this._actionsSize++
    this.watch(
      () => !!action.isPending,
      ((bitPosition) => (isPending: boolean) => {
        this._hasPendingActions.value = updateBit(
          this._hasPendingActions.value,
          bitPosition,
          isPending,
        )
      })(this._actionsSize),
    )

    this.watch(
      () => !!action.isError,
      ((bitPosition) => (isError: boolean) => {
        this._hasActionWithError.value = updateBit(
          this._hasActionWithError.value,
          bitPosition,
          isError,
        )
      })(this._actionsSize),
    )

    return action
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
