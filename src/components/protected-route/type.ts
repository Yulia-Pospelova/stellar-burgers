import type { Location } from 'react-router-dom';

export type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.JSX.Element;
};

export type TFromLocationState = {
  from?: Location;
} | null;
