import { useState } from 'react';
import BookForm from '../bookform';
import BookList from '../booklist';
import './Body.css';

type PageMode = 'register' | 'list';

export function Body() {
  const [pageMode, setPageMode] = useState<PageMode>('list');

  const updatePageMode = (mode: PageMode) => {

    setPageMode(mode);
  }

  return (
    <div className="Body">
      <nav className="Body-Nav">
        <ul>
          <li onClick={() => updatePageMode('list')}>Books</li>
          <li onClick={() => updatePageMode('register')}>Register Book</li>
        </ul>
      </nav>
      <article className="Body-Content">
        { pageMode === 'list'
          ? <BookList />
          : <BookForm />
        }
      </article>
    </div>
  );
}
