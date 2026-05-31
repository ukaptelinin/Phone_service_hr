import { IMoviesResponseContext, MoviesListContext } from '@/entities/movies-list/model/context';
import { useContext } from 'react';

export const useMoviesListContext = (): IMoviesResponseContext => {
  const context = useContext(MoviesListContext);
  return context;
};
