import { fetchIngredients, ingredientsSlice } from '@slices/ingredients-slice';

import { mockIngredients } from './mock-data';

const reducer = ingredientsSlice.reducer;

const initialState = {
  items: [],
  isLoading: true,
  error: null,
};

const requestId = 'test-request-id';

describe('редьюсер слайса ingredients', () => {
  it('возвращает начальное состояние на неизвестный экшен', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  it('fetchIngredients.pending: включает загрузку и очищает прошлую ошибку', () => {
    const state = reducer(
      { items: [], isLoading: false, error: { message: 'Прошлая ошибка' } },
      fetchIngredients.pending(requestId, undefined)
    );

    expect(state).toEqual(initialState);
  });

  it('fetchIngredients.fulfilled: сохраняет ингредиенты и выключает загрузку', () => {
    const state = reducer(
      initialState,
      fetchIngredients.fulfilled(mockIngredients, requestId, undefined)
    );

    expect(state).toEqual({
      items: mockIngredients,
      isLoading: false,
      error: null,
    });
  });

  it('fetchIngredients.rejected: сохраняет ошибку и выключает загрузку', () => {
    const state = reducer(
      initialState,
      fetchIngredients.rejected(new Error('Запрос не выполнен'), requestId, undefined)
    );

    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error?.message).toBe('Запрос не выполнен');
  });
});
