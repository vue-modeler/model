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
  // хранит вычисляемое значение ошибки для каждого действия.
  // Значения строится на основе this._actionState
  protected _error = shallowRef<ModelError | null>(null)
  protected _effectScope = effectScope(true)

  // используем WeakMap что бы ключами для хранения дейстий были не имена, а сами функции
  // Ключи строки вызывают ошибку при вызове родительского действия из дочернего
  // Текст ошибки - "Attempt change status from pending to pending"
  //
  // @action someAction() {
  //   super.someAction() - здесь была ошибка при использовании ключей строк
  // }
  protected _actions = new Map<OriginalMethodWrapper, Action>()
  protected _unwatchers = new Set<ReturnType<typeof watch>>()

  protected _hasActionWithError = ref(0)
  protected _hasPendingActions = ref(0)

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

    this.watch(
      () => !!action.isPending,
      ((bitPosition) => (isPending: boolean) => {
        this._hasPendingActions.value = updateBit(
          this._hasPendingActions.value,
          bitPosition,
          isPending,
        )
      })(this._actions.size),
    )

    this.watch(
      () => !!action.isError,
      ((bitPosition) => (isError: boolean) => {
        this._hasActionWithError.value = updateBit(
          this._hasActionWithError.value,
          bitPosition,
          isError,
        )
      })(this._actions.size),
    )

    return action
  }

  isModelOf (typeModel: ModelConstructor): boolean {
    return this instanceof typeModel
  }

  // TODO: add tests
  action (originalMethod: OriginalMethodWrapper): ShallowReactive<ActionPublic> {
    return this._actions.get(originalMethod) || this.createAction(originalMethod)
  }

  destructor (): void {
    this._unwatchers.forEach((unwatcher) => { unwatcher() })
    this._unwatchers = new Set()

    this._effectScope.stop()
  }
}
