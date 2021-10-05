import { useContext, useEffect, useState } from "react";
import { BranchContext } from "../main/Main";
import { Book, Branch } from "../types";
import './BookList.css';

export const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [transferringId, setTransferringId] = useState<number | null>(null);
  const [otherBranches, setOtherBranches] = useState<Branch[]>([]);
  const branch = useContext(BranchContext);

  useEffect(() => {
    fetch('/api/branches', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => r.json())
      .then((branches: Branch[]) => {
        setOtherBranches(branches.filter(b => b.accountAddress !== branch?.accountAddress));
      });
  }, [branch]);

  useEffect(() => {
    fetch('/api/books', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => r.json())
      .then((books: Book[]) => {
        setBooks(books.filter(b => b.address === branch?.accountAddress));
      });
  }, [branch]);

  const transfer = (bookId: number, branchIdStr: string) => {
    const branchId = Number.parseInt(branchIdStr);

    if (branchId > -1) {
      const to = otherBranches.find(b => b.id === branchId);
      setTransferringId(bookId);

      fetch(`/api/books/${bookId}/transfer`, {
        body: JSON.stringify({ 'to': to?.accountAddress || ''}),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-From-Address': branch?.accountAddress || ''
        }
      })
        .then(r => r.json())
        .then((r: Book) => {
          setTransferringId(null);
          setBooks(books.filter(b => b.id !== r.id));
        });
    }
  };

  if (books.length === 0) {
    return <p>No books yet! :(</p>
  }

  return (
    <table className='BookList-Table'>
      <thead>
        <tr className='BookList-Header'>
          <th>ID</th>
          <th>Title</th>
          <th>ISBN</th>
          <th>Author</th>
          <th>Status</th>
          <th>Xfer</th>
        </tr>
      </thead>
      <tbody>
        { books.map(book =>
          <tr key={book.tokenId} className='BookList-Entry'>
            <td>{book.tokenId}</td>
            <td>{book.title}</td>
            <td>{book.isbn}</td>
            <td>{book.author}</td>
            <td>{book.status}</td>
            <td>
              { transferringId && transferringId === book.id ?
              'Transferring...' :
              <select onChange={(e) => transfer(book.id, e.target.value)}>
                <option value={-1}>Transfer to:</option>
                { otherBranches.map(b =>
                  <option key={b.id} value={b.id}>{b.name}</option>)
                }
              </select>
              }
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
