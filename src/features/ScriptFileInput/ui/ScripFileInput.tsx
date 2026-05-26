import type { FC } from 'react';
import { Button, Form, Input } from '@heroui/react';
//import { useMoviesListContext } from '@/entities/movies-list';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/20/solid';




export const ScriptFileInput: FC = () => {
 // const { currentTitle, getFreshMovies } = useMoviesListContext();
  const navigate = useNavigate();
  const onSearcheMovie = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //const formData = new FormData(e.currentTarget);
    //const title = formData.get('search') as string;
//    await getFreshMovies(title);
    navigate(`/call/phonenumber`);
  };

  return (
    <Form className="flex items-center gap-2 grow" onSubmit={onSearcheMovie}>
      <div className="relative flex items-center grow">
      <Input
        className="grow"
        name="search"
        placeholder="URL-адрес скрипта "
        type="text"
        />
          <Button
            type="submit"
            isIconOnly
            variant="ghost"
            aria-label="Search"
            className="text-default-400 hover:bg-default-100"
          >
            <ArrowRightIcon className="w-6 h-6 text-default-400 pointer-events-none shrink-0" />
          </Button>
        </div>
        
    </Form>
  );
};
