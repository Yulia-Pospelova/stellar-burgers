import { selectConstructorItems } from '@slices/constructor-slice';
import {
  createOrder,
  resetOrderModal,
  selectOrderModalData,
  selectOrderRequest,
} from '@slices/order-slice';
import { selectUser } from '@slices/user-slice';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);

  const onOrderClick = (): void => {
    if (!user) {
      void navigate('/login');
      return;
    }

    if (!constructorItems.bun || orderRequest) return;

    const { bun, ingredients } = constructorItems;
    void dispatch(
      createOrder([bun._id, ...ingredients.map((item) => item._id), bun._id])
    );
  };

  const closeOrderModal = (): void => {
    dispatch(resetOrderModal());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
