import { MouseEvent, useContext, useState } from "react";
import { BranchContext } from "../main/Main";
import './BookForm.css';

export const BookForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const fromAddr = useContext(BranchContext)?.accountAddress || '';

  const submitForm = (e: MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSubmitting(true);

    fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-From-Address': fromAddr
      },
      body: JSON.stringify({
        title: title,
        isbn: isbn,
        author: author
      })
    }).then(res => {
      setSubmitting(false);
      if (res.status === 201) {
        setTitle('');
        setIsbn('');
        setAuthor('');
        setMessage('Created!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        res.text().then(t => setMessage(t));
      }
    });
  };

  return (
    <div className='BookForm'>
      <h4>Register new book</h4>
      { message.length > 0 &&
        <div className='BookForm-Info'>
          <div className='BookForm-Info-X' onClick={() => setMessage('')}>X</div>
          <div>{message}</div>
        </div>
      }
      <form>
        <div className='BookForm-Input'>
          <label htmlFor='title'>
            Title:
          </label>
          <input
            id='title'
            type='text'
            placeholder="Title of book"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
        </div>
        <div className='BookForm-Input'>
          <label htmlFor='isbn'>
            ISBN:
          </label>
          <input
            id='isbn'
            type='text'
            placeholder="ISBN (with dashes)"
            onChange={(e) => setIsbn(e.target.value)}
            value={isbn}
          />
        </div>
        <div className='BookForm-Input'>
          <label htmlFor='author'>
            Author:
          </label>
          <input
            id='author'
            type='text'
            placeholder="Name of Author"
            onChange={(e) => setAuthor(e.target.value)}
            value={author}
          />
        </div>
        <div className="BookForm-Submit">
          <input
            type='submit'
            disabled={submitting}
            value={submitting ? 'Submitting...' : 'Submit'}
            onClick={submitForm}
          />
        </div>
      </form>
    </div>
  );
}
