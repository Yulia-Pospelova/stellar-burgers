import { fetchUserOrders, selectUserOrders } from '@slices/user-orders-slice';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);

  useEffect(() => {
    void dispatch(fetchUserOrders());
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
