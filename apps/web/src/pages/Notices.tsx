import React, { useState } from 'react';
import { useNotices, useEvents, useDeleteNotice, useDeleteEvent } from '../hooks/useCommunication';
import { Megaphone, Calendar as CalendarIcon, Plus, BellRing, Clock, Trash2, Download } from 'lucide-react';
import CreateNoticeModal from '../components/communication/CreateNoticeModal';
import CreateEventModal from '../components/communication/CreateEventModal';
import { useAuthStore } from '../store/authStore';

export default function Notices() {
  const { user } = useAuthStore();
  const { data: notices, isLoading: isLoadingNotices } = useNotices();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  
  const deleteNotice = useDeleteNotice();
  const deleteEvent = useDeleteEvent();

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const handleDeleteNotice = (id: string) => {
    if(window.confirm('Are you sure you want to delete this notice?')) {
      deleteNotice.mutate(id);
    }
  };

  const handleDeleteEvent = (id: string) => {
    if(window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Communication Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage school-wide notices and academic events.</p>
        </div>
        {user?.role !== 'student' && (
          <div className="flex space-x-3">
            <a
              href={`http://localhost:5000/api/v1/communication/events/feed/${user?.schoolId}.ics`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-bold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <Download className="-ml-1 mr-2 h-4 w-4 text-slate-500" />
              Subscribe .ics
            </a>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-bold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <CalendarIcon className="-ml-1 mr-2 h-4 w-4 text-slate-500" />
              Add Event
            </button>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98]"
            >
              <Megaphone className="-ml-1 mr-2 h-4 w-4" />
              Post Notice
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Notices Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <BellRing className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recent Notices</h2>
          </div>

          {isLoadingNotices ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Loading notices...
            </div>
          ) : notices?.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No notices posted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices?.map((notice) => (
                <div key={notice._id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{notice.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {notice.audience}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{notice.body}</p>
                  <div className="mt-4 flex justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Posted on {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                    {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'principal') && (
                      <button onClick={() => handleDeleteNotice(notice._id)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Academic Calendar */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Upcoming Events</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {isLoadingEvents ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Loading events...</div>
            ) : events?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No upcoming events.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {events?.map((event) => {
                  const startDate = new Date(event.startDate);
                  const month = startDate.toLocaleString('default', { month: 'short' });
                  const day = startDate.getDate();
                  
                  let badgeColor = 'bg-blue-100 text-blue-700';
                  if (event.type === 'holiday') badgeColor = 'bg-green-100 text-green-700';
                  if (event.type === 'exam') badgeColor = 'bg-red-100 text-red-700';

                  return (
                    <div key={event._id} className="p-5 flex items-start space-x-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 transition-colors">
                      <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-none mb-1">{month}</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">{day}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                        <div className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                          {event.type}
                        </div>
                        {event.description && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'principal') && (
                        <button onClick={() => handleDeleteEvent(event._id)} className="ml-auto text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      <CreateNoticeModal isOpen={isNoticeModalOpen} onClose={() => setIsNoticeModalOpen(false)} />
      <CreateEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
    </div>
  );
}
