import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { BookMarked, BookUp, Users, Search, Plus, BookDown } from 'lucide-react';
import { useBooks, useAddBook, useIssueBook, useReturnBook } from '../hooks/useLibrary';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';

export default function Library() {
  const { user } = useAuthStore();
  const { data: books, isLoading: isBooksLoading } = useBooks();
  const { data: users } = useUsers();
  const addBook = useAddBook();
  const issueBook = useIssueBook();
  const returnBook = useReturnBook();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState<string | null>(null);
  
  // Add Book Form
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', totalCopies: 1 });
  
  // Issue Book Form
  const [issueData, setIssueData] = useState({ userId: '', dueDate: '' });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    addBook.mutate(newBook, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewBook({ title: '', author: '', isbn: '', totalCopies: 1 });
      }
    });
  };

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showIssueModal) return;
    issueBook.mutate({ id: showIssueModal, data: issueData }, {
      onSuccess: () => {
        setShowIssueModal(null);
        setIssueData({ userId: '', dueDate: '' });
      }
    });
  };

  const filteredBooks = books?.filter((b: any) => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Library Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage catalog, checkouts, and returns.</p>
        </div>
        {user?.role !== 'student' && user?.role !== 'parent' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Book
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search books by title or author..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isBooksLoading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Loading catalog...</div>
        ) : filteredBooks?.map((book: any) => (
          <div key={book._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <BookMarked className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{book.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">By {book.author}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm mb-6">
              <div className="text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">{book.availableCopies}</span> / {book.totalCopies} Available
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">{book.currentBorrowers.length}</span> Borrowed
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {user?.role !== 'student' && user?.role !== 'parent' ? (
                <>
                  <button 
                    onClick={() => setShowIssueModal(book._id)}
                    disabled={book.availableCopies < 1}
                    className="w-full flex justify-center items-center py-2 px-4 border border-indigo-200 dark:border-indigo-900/50 rounded-lg shadow-sm text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50 transition-colors"
                  >
                    <BookUp className="w-4 h-4 mr-2" />
                    Issue Book
                  </button>
                  
                  {book.currentBorrowers.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Borrowers</p>
                      {book.currentBorrowers.map((borrower: any) => (
                        <div key={borrower._id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-2">{borrower.userId?.name}</span>
                          <button 
                            onClick={() => returnBook.mutate({ id: book._id, data: { userId: borrower.userId?._id } })}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center shrink-0"
                          >
                            <BookDown className="w-3 h-3 mr-1" />
                            Return
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-2 text-sm font-medium text-slate-500">
                  {book.currentBorrowers.some((b:any) => b.userId?._id === user?._id) ? 
                    <span className="text-indigo-600">You borrowed this book</span> : 
                    book.availableCopies > 0 ? <span className="text-emerald-600">Available</span> : <span className="text-red-500">Out of Stock</span>
                  }
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Book Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Add New Book</h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Author</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">ISBN (Optional)</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Copies</label>
                  <input type="number" min="1" required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={newBook.totalCopies} onChange={e => setNewBook({...newBook, totalCopies: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 px-4 border rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={addBook.isPending} className="flex-1 py-2 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700">Add Book</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Issue Book Modal */}
      {showIssueModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Issue Book</h2>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select User</label>
                <select required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={issueData.userId} onChange={e => setIssueData({...issueData, userId: e.target.value})}>
                  <option value="">Select a user...</option>
                  {users?.filter((u:any) => u.role === 'student' || u.role === 'teacher').map((u:any) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input type="date" required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={issueData.dueDate} onChange={e => setIssueData({...issueData, dueDate: e.target.value})} />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowIssueModal(null)} className="flex-1 py-2 px-4 border rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={issueBook.isPending} className="flex-1 py-2 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700">Confirm Issue</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
