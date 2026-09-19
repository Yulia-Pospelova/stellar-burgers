import { loginUser } from '@slices/user-slice';
import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';

import { useDispatch } from '@services/store';

import type { SerializedError } from '@reduxjs/toolkit';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<SerializedError | null>(null);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    setError(null);
    void dispatch(loginUser({ email, password }))
      .unwrap()
      .catch((err: SerializedError) => setError(err));
  };

  return (
    <LoginUI
      errorText={error?.message}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
