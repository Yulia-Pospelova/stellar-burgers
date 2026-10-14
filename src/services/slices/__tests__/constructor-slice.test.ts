import {
  addIngredient,
  constructorSlice,
  moveIngredient,
  removeIngredient,
} from '@slices/constructor-slice';
import { createOrder } from '@slices/order-slice';

import { mockBun, mockMain, mockOrder, mockSauce } from './mock-data';

import type { TConstructorState } from '@utils-types';

const reducer = constructorSlice.reducer;

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const requestId = 'test-request-id';

describe('редьюсер слайса burgerConstructor', () => {
  it('возвращает начальное состояние на неизвестный экшен', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  it('addIngredient: кладёт булку в поле bun', () => {
    const state = reducer(initialState, addIngredient(mockBun));

    expect(state.bun).toMatchObject(mockBun);
    expect(typeof state.bun?.id).toBe('string');
    expect(state.ingredients).toEqual([]);
  });

  it('addIngredient: новая булка заменяет прежнюю', () => {
    const stateWithBun = reducer(initialState, addIngredient(mockBun));
    const state = reducer(stateWithBun, addIngredient({ ...mockBun, _id: 'other-bun' }));

    expect(state.bun?._id).toBe('other-bun');
  });

  it('addIngredient: добавляет начинку в конец списка', () => {
    const stateWithMain = reducer(initialState, addIngredient(mockMain));
    const state = reducer(stateWithMain, addIngredient(mockSauce));

    expect(state.ingredients).toHaveLength(2);
    expect(state.ingredients[0]).toMatchObject(mockMain);
    expect(state.ingredients[1]).toMatchObject(mockSauce);
  });

  it('addIngredient: у двух одинаковых начинок разные id', () => {
    const stateWithMain = reducer(initialState, addIngredient(mockMain));
    const state = reducer(stateWithMain, addIngredient(mockMain));

    expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
  });

  it('removeIngredient: удаляет начинку по id', () => {
    const stateWithMain = reducer(initialState, addIngredient(mockMain));
    const state = reducer(
      stateWithMain,
      removeIngredient(stateWithMain.ingredients[0].id)
    );

    expect(state.ingredients).toEqual([]);
  });

  it('moveIngredient: меняет порядок начинок', () => {
    const stateWithMain = reducer(initialState, addIngredient(mockMain));
    const stateWithTwo = reducer(stateWithMain, addIngredient(mockSauce));
    const state = reducer(stateWithTwo, moveIngredient({ from: 1, to: 0 }));

    expect(state.ingredients.map((item) => item._id)).toEqual([
      mockSauce._id,
      mockMain._id,
    ]);
  });

  it('createOrder.fulfilled: очищает конструктор', () => {
    const stateWithBun = reducer(initialState, addIngredient(mockBun));
    const stateWithMain = reducer(stateWithBun, addIngredient(mockMain));
    const state = reducer(
      stateWithMain,
      createOrder.fulfilled(mockOrder, requestId, [mockBun._id])
    );

    expect(state).toEqual(initialState);
  });
});
