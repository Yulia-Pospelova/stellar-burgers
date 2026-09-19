import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';
import type { ReactNode } from 'react';
import type { Location } from 'react-router-dom';

export type AppContentProps = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

export type DetailPageProps = {
  title: string;
  children: ReactNode;
};

export type TLocationState = {
  background?: Location;
} | null;
