import { isShallow, watch } from 'vue'

import { describe, expect, it } from 'vitest'
import { ActionError } from '../../src/error/action-error'
import { ActionStatusConflictError } from '../../src/error/action-status-conflict-error'
import { actionErrorWithTwoNested, actionStatesForParallel, actionSuccessWithTwoNested, nestedWithAbort, nestedWithAbortAll, nestedWithLock, singleErrorAction, singleSuccessAction } from './fixture/action-state'
import { createApiMock } from './test-model/create-api-mock'
import { createTestModel } from './test-model/create-test-model'

export interface ApiService {
  sendRequest: (...args: unknown[]) => Promise<unknown>
  sendRequestFromParent: (...args: unknown[]) => Promise<unknown>
}

describe('Test model', () => {

  it('calls action without args successfully', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)
    expect(model.testGetter).toBe(1)
    expect(model.testReadonly).toBe('readonly')

    const originStates: object[] = []

    expect(isShallow(model.successActionWithoutArgs)).toBeTruthy()

    watch(
      () => ({
        state: model.successActionWithoutArgs.state,
      }),
      (state) => originStates.push(state),
    )

    await model.successActionWithoutArgs.exec()

    expect(originStates.length).toEqual(singleSuccessAction.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(singleSuccessAction[index])
    })

    expect(apiMock.sendRequest.mock.calls).toHaveLength(1)
    expect(apiMock.sendRequest.mock.calls[0]).toHaveLength(1)
    expect(apiMock.sendRequest.mock.calls[0][0]).toBeInstanceOf(AbortController)
  })

  it('calls action with args successfully', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)
    const originStates: object[] = []

    watch(
      () => ({ state: model.successActionWithArgs.state }),
      (state) => originStates.push(state),
    )

    const argNumber = 1
    const argString = 'string'
    const argObject = {}
    const actionPromise = model.successActionWithArgs.exec(argNumber, argString, argObject)
    const callArgs = model.successActionWithArgs.args
    
    await actionPromise

    expect(originStates.length).toEqual(singleSuccessAction.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(singleSuccessAction[index])
    })

    expect(apiMock.sendRequest.mock.calls).toHaveLength(1)

    const argsCount = apiMock.sendRequest.mock.calls[0]
    expect(argsCount).toHaveLength(4)
    expect(apiMock.sendRequest.mock.calls[0][0]).toEqual(argNumber)
    expect(apiMock.sendRequest.mock.calls[0][1]).toEqual(argString)
    expect(apiMock.sendRequest.mock.calls[0][2]).toEqual(argObject)
    expect(apiMock.sendRequest.mock.calls[0][3]).toBeInstanceOf(AbortController)

    expect(callArgs[0]).toEqual(argNumber)
    expect(callArgs[1]).toEqual(argString)
    expect(callArgs[2]).toEqual(argObject)
  })

  it('calls redefined action from super class', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)
    const originStates: object[] = []

    watch(
      () => ({ state: model.actionWithSuperCall.state }),
      (state) => originStates.push(state),
    )

    await model.actionWithSuperCall.exec(1, '2', {})

    expect(originStates.length).toEqual(singleSuccessAction.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(singleSuccessAction[index])
    })

    const argsCount = apiMock.sendRequestFromParent.mock.calls[0]
    expect(argsCount).toHaveLength(4)
    expect(apiMock.sendRequestFromParent.mock.calls[0][0]).toEqual(1)
    expect(apiMock.sendRequestFromParent.mock.calls[0][1]).toStrictEqual('2')
    expect(apiMock.sendRequestFromParent.mock.calls[0][2]).toEqual({})
    expect(apiMock.sendRequestFromParent.mock.calls[0][3]).toBeInstanceOf(AbortController)
  })

  it('action state becomes an error when action throws error', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)
    const originStates: object[] = []

    watch(() => ({
      state: model.singleErrorAction.state,
    }), (state) => originStates.push(state))

    await model.singleErrorAction.exec()

    expect(originStates.length).toEqual(singleErrorAction.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(singleErrorAction[index])
    })
    const actionError = model.singleErrorAction.error

    expect(actionError).toBeInstanceOf(ActionError)
    expect(actionError?.message).toEqual('Action singleErrorAction throw error')
    expect(actionError?.cause).toEqual(new Error())
  })

  it('calls two nested actions from single root without error', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    const root = model.rootSuccessAction
    const nestedA = model.nestedActionA
    const nestedB = model.nestedActionB
    const originStates: object[] = []

    watch(() => ({
      root: root.state,
      nestedA: nestedA.state,
      nestedB: nestedB.state,
    }), (state) => originStates.push(state))

    const pendingState: boolean[] = []
    watch(
      () => model.hasPendingActions,
      (state) => pendingState.push(state),
    )

    await model.rootSuccessAction.exec()

    expect(originStates.length).toEqual(actionSuccessWithTwoNested.length)
    expect(pendingState.length).toEqual(2)
    expect(pendingState[0]).toBeTruthy()
    expect(pendingState[1]).toBeFalsy()

    originStates.forEach((originState, index) => {
      expect(originState).toEqual(actionSuccessWithTwoNested[index])
    })
  })

  it('state of root action is ready when nested action throws error', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    const root = model.rootErrorAction
    const nestedA = model.nestedActionA
    const nestedB = model.singleErrorAction
    const originStates: object[] = []

    watch(() => ({
      root: root.state,
      nestedA: nestedA.state,
      nestedB: nestedB.state,
    }), (state) => originStates.push(state))

    await model.rootErrorAction.exec()

    expect(originStates.length).toEqual(actionErrorWithTwoNested.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(actionErrorWithTwoNested[index])
    })

    const nestedError = model.singleErrorAction.error

    expect(nestedError).toBeInstanceOf(ActionError)
    expect(nestedError?.message).toEqual('Action singleErrorAction throw error')
    expect(nestedError?.cause).toEqual(new Error())
  })
  
  it('calls several independente actions in parallel without error', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    const nestedA = model.nestedActionA
    const nestedB = model.nestedActionB

    const originStates: object[] = []

    watch(() => ({
      nestedA: nestedA.state,
      nestedB: nestedB.state,
    }), (state) => originStates.push(state))

    await Promise.all([
      model.nestedActionA.exec(),
      model.nestedActionB.exec(),
    ])

    expect(originStates.length).toEqual(actionStatesForParallel.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(actionStatesForParallel[index])
    })
  })

  it('throws an error when calling the same action in parallel', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    expect.assertions(1)
    try {
      await Promise.all([
        model.successActionWithoutArgs.exec(),
        model.successActionWithoutArgs.exec(),
      ])
    } catch (error) {
      expect(error).toEqual(
        new ActionStatusConflictError(
          'successActionWithoutArgs',
          'pending',
          'pending',
        ),
      )
    }
  })

  it('throws an error when calling the same action recursively', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    expect.assertions(1)
    try {
      await model.recursivelyAction.exec()
    } catch (error) {
      expect(error).toEqual(
        new ActionStatusConflictError(
          'recursivelyAction',
          'pending',
          'pending',
        ),
      )
    }
  })

  it('root action becomes ready without errors after aborting nested action from external execution context', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    const rootAction = model.rootWithNestedAndAbort
    const nestedAction = model.nestedWithAbort

    const originStates: object[] = []
    watch(() => ({
      root: rootAction.state,
      nested: nestedAction.state,
    }), (state) => originStates.push(state))

    void setTimeout(() => void model.nestedWithAbort.abort(), 0)
    await model.rootWithNestedAndAbort.exec(false)

    expect(originStates.length).toEqual(nestedWithAbort.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(nestedWithAbort[index])
    })
  })

  it('root action becomes abort without errors after sharing Abortcontroller with nested action which is aborted', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    const rootAction = model.rootWithNestedAndAbort
    const nestedAction = model.nestedWithAbort

    const originStates: object[] = []
    watch(() => ({
      root: rootAction.state,
      nested: nestedAction.state,
    }), (state) => originStates.push(state))

    void setTimeout(() => void model.nestedWithAbort.abort(), 0)
    await model.rootWithNestedAndAbort.exec(true)

    expect(originStates.length).toEqual(nestedWithAbortAll.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(nestedWithAbortAll[index])
    })
  })

  it('root action becomes ready without error if any of nested action locked', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    const rootState = model.rootWithNestedAndAbort
    const nestedState = model.nestedWithAbort

    const originStates: object[] = []
    watch(() => ({
      root: rootState.state,
      nested: nestedState.state,
    }), (state) => originStates.push(state))

    void setTimeout(() => void model.nestedWithAbort.lock(), 0)
    await model.rootWithNestedAndAbort.exec(false)

    expect(originStates.length).toEqual(nestedWithLock.length)
    originStates.forEach((originState, index) => {
      expect(originState).toEqual(nestedWithLock[index])
    })
  })

  it('any synchronous methods work like native', () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    expect(model.regularMethodWithData(10)).toEqual(10)
    expect(() => { model.regularMethodWithError(); }).toThrowError()
  })

  // it('any asynchronous method with not void result works like native', () => {
  //   const apiMock = createApiMock()
  //   const model = createTestModel(apiMock)

  //   expect(model.regularAsyncMethodWithData(10)).resolves.toEqual(10)
  // })

  it('any asynchronous method without @action decorator and with void result is seen like Action but throws error in runtime', async () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    expect.assertions(2)
    try {
      await model.regularAsyncMethodWithError.exec('I won`t be called')
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
      expect((error as Error).message).toEqual('model.regularAsyncMethodWithError.exec is not a function')
    }
  })

  it('native method can get a action inside by origin action method', () => {
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    expect(model.nestedActionA === model.regularMethodWithActionInside()).toBeTruthy()
  })
})

