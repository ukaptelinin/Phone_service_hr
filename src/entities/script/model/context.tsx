import { fetchMovies } from '@/shared/api';
import { MoviesResponse } from '@/shared/api/types';
import { createContext, FC, ReactNode, useRef, useState, useTransition } from 'react';
export interface IMoviesResponseContext {
  moviesList: MoviesResponse[];
  currentTitle: string;
  error: string | null;
  isUrlChange: boolean;
  isPending: boolean;
  getFreshMovies: (movieTitle: string) => Promise<void>;
  loadMoreMovies: () => Promise<void>;
  toggleIsUrlChange: () => void;
}

export const MoviesListContext = createContext<IMoviesResponseContext>({
  moviesList: [],
  currentTitle: '',
  error: null,
  isUrlChange: false,
  isPending: false,
  getFreshMovies: () => Promise.resolve(),
  loadMoreMovies: () => Promise.resolve(),
  toggleIsUrlChange: () => {},
});

export const MoviesContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const pageNumberRef = useRef(1);
  const totalPagesRef = useRef(1);
  const [currentTitle, setCurrentTitle] = useState('');
  const [moviesList, setMoviesList] = useState<MoviesResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUrlChange,setIsUrlChange] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
 

  const getFreshMovies = async (movieTitle: string): Promise<void> => {
    await startTransition(async () => {
      try {
        setError(null);
        if (movieTitle === '') return;
        setCurrentTitle(movieTitle);
        pageNumberRef.current = 1;
        setMoviesList([]);
        const { docs, pages } = await fetchMovies(movieTitle, 1);
        totalPagesRef.current = pages;
        setMoviesList(docs);
      } catch (error) {
        setError(
          error instanceof Error && error.message === 'Фильмы не найдены'
            ? error.message
            : 'Что-то пошло не так',
        );
      }
    });
  };

  const loadMoreMovies = async (): Promise<void> => {
    await startTransition(async () => {
      if (pageNumberRef.current === totalPagesRef.current) return;
      try {
        setError(null);
        pageNumberRef.current = pageNumberRef.current + 1;
        const { docs } = await fetchMovies(currentTitle, pageNumberRef.current);
        setMoviesList((prevMovies) => [...prevMovies, ...docs]);
      } catch (error) {
        setError(
          error instanceof Error && error.message === 'Фильмы не найдены'
            ? error.message
            : 'Что-то пошло не так',
        );
        pageNumberRef.current = pageNumberRef.current - 1;
      }
    });
  };
  const toggleIsUrlChange = ():void => setIsUrlChange(!isUrlChange);

  return (
    <MoviesListContext.Provider
      value={{
        moviesList,
        currentTitle,
        error,
        isUrlChange,
        isPending,
        getFreshMovies,
        loadMoreMovies,
        toggleIsUrlChange,
      }}
    >
      {children}
    </MoviesListContext.Provider>
  );
};
