import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatContacts, useChatMessages, useSendMessage } from '../hooks/useChat';
import { Search, Send, User as UserIcon, MessageSquare } from 'lucide-react';

export default function Chat() {
  const { user } = useAuthStore();
  const { data: contacts, isLoading: isContactsLoading } = useChatContacts();
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: messages } = useChatMessages(selectedContact?._id);
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    
    sendMessage.mutate({ receiverId: selectedContact._id, message: newMessage }, {
      onSuccess: () => setNewMessage('')
    });
  };

  const filteredContacts = contacts?.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col -mx-6 -my-6 lg:-mx-10 lg:-my-10 h-[calc(100vh-80px)] bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar / Contacts List */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search contacts..." 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isContactsLoading ? (
              <div className="p-4 text-center text-slate-500 text-sm">Loading contacts...</div>
            ) : filteredContacts?.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">No contacts found.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredContacts?.map((contact: any) => (
                  <button
                    key={contact._id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center space-x-3 ${selectedContact?._id === contact._id ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                        {contact.profilePic ? (
                          <img src={contact.profilePic} alt={contact.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      {contact.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">{contact.name}</h3>
                        {contact.lastMessageTime && (
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(contact.lastMessageTime).toLocaleDateString() === new Date().toLocaleDateString() 
                              ? new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date(contact.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-xs truncate ${contact.unreadCount > 0 ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                          {contact.lastMessage || <span className="italic">No messages yet</span>}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col">
          {!selectedContact ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-2">Your Messages</h2>
              <p className="text-sm">Select a contact from the sidebar to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                    {selectedContact.profilePic ? (
                      <img src={selectedContact.profilePic} alt={selectedContact.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedContact.name}</h2>
                    <p className="text-xs text-slate-500 capitalize">{selectedContact.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-slate-500">
                    This is the beginning of your conversation with {selectedContact.name}.
                  </div>
                ) : (
                  messages?.map((msg: any, index: number) => {
                    const isMe = msg.senderId === user?._id;
                    const showTime = index === 0 || new Date(msg.createdAt).getTime() - new Date(messages[index-1].createdAt).getTime() > 300000; // 5 min gap
                    
                    return (
                      <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {showTime && (
                          <span className="text-[10px] text-slate-400 mb-2 mt-2 font-medium">
                            {new Date(msg.createdAt).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <form onSubmit={handleSend} className="flex items-end space-x-2">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                    <textarea 
                      placeholder={`Message ${selectedContact.name}...`}
                      className="w-full max-h-32 bg-transparent p-3 outline-none resize-none text-sm dark:text-white custom-scrollbar"
                      rows={1}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex-shrink-0"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
