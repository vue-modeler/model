import { TestModel } from './test-model/test-model'
import { Action } from '../../action'
import { ActionInternalException } from '../../error/action-internal-exception'

describe('The action constructor', () => {
  test('successfully creates new instance for method decorated like action', async () => {
    const model = new TestModel()
    const action = new Action(model, model.singleSuccessAction)

    expect(action.isReady).toBeTruthy()
  })

  test('throws an error for a any method not decorated like action', () => {
    const model = new TestModel()
    expect(() => new Action(model, model.nativeMethodWithData))
      .toThrowError(new ActionInternalException('Method nativeMethodWithData is not action'))
  })

  test('throws error if  trying to create action from function which is not instance method', () => {
    const model = new TestModel()
    function someFunction (): Promise<void> {
      return Promise.resolve()
    }

    expect(() => new Action(model, someFunction))
      .toThrowError(new ActionInternalException('Model does not contain method someFunction'))
  })

  test('throws error if  trying to create action from a function with invalid ACTION_FLAG', () => {
    const model = new TestModel()

    expect(() => new Action(model, model.nativeAsyncMethodWithError))
      .toThrowError(new ActionInternalException('Method nativeAsyncMethodWithError is not action'))
  })

  test('does not throw error if action function has valid ACTION_FLAG and it`s name matches with name of any model method', () => {
    // In correct implementation this test should give an error,
    // but at the moment  we can compare the model method and
    // the action function only by name.
    // Reason of it is described as comment in Action constructor.
    // It is not critical, because actions are created inside model always.
    // We fully control this process.
    const model = new TestModel()
    function singleSuccessAction (): Promise<void> {
      return Promise.resolve()
    }

    singleSuccessAction[Action.actionFlag] = (): Promise<void> => {
      return Promise.resolve()
    }

    expect(() => new Action(model, singleSuccessAction))
      .not.toThrowError()
  })
})
