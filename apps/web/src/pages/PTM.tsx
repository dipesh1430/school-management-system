import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, Calendar, Video, Clock, Link as LinkIcon, User as UserIcon } from 'lucide-react';
import { usePTMSchedules, useCreatePTMSchedule } from '../hooks/usePTM';
import { useClasses } from '../hooks/useClasses';
import { useAuthStore } from '../store/authStore';
import CustomSelect from '../components/ui/CustomSelect';
import CustomDatePicker from '../components/ui/CustomDatePicker';

export default function PTM() {
  const { user } = useAuthStore();
  const { data: schedules } = usePTMSchedules();
  const { data: classes } = useClasses();
  
  const createSchedule = useCreatePTMSchedule();

  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New Schedule Form
  const [newSchedule, setNewSchedule] = useState({ 
    classId: '', 
    date: new Date(), 
    meetingProvider: 'Manual',
    meetingLink: '',
    slotDuration: '15',
    startTime: '09:00',
    endTime: '12:00'
  });

  const generateSlots = (start: string, end: string, durationMin: number) => {
    const slots = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let current = new Date();
    current.setHours(startH, startM, 0);
    
    const endObj = new Date();
    endObj.setHours(endH, endM, 0);

    while (current < endObj) {
      slots.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      current.setMinutes(current.getMinutes() + durationMin);
    }
    return slots;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const slots = generateSlots(newSchedule.startTime, newSchedule.endTime, parseInt(newSchedule.slotDuration));
    
    createSchedule.mutate({
      classId: newSchedule.classId,
      date: newSchedule.date,
      meetingProvider: newSchedule.meetingProvider,
      meetingLink: newSchedule.meetingLink,
      slots
    }, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewSchedule({ ...newSchedule, classId: '', meetingLink: '' });
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Parent-Teacher Meetings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage availability and upcoming appointments.</p>
        </div>
        {user?.role !== 'student' && user?.role !== 'parent' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Create Schedule
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {schedules?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Schedules Found</h3>
            <p className="text-slate-500 max-w-sm">You haven't set up any PTM availability yet. Click "Create Schedule" to open up time slots for parents.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules?.map((schedule: any) => (
              <div key={schedule._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{new Date(schedule.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{schedule.classId?.name}</h3>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {schedule.slots.filter((s:any) => s.status === 'Booked').length} / {schedule.slots.length} Booked
                  </span>
                </div>
                
                <div className="p-5 bg-slate-50/50 dark:bg-slate-950/50 flex-1">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 mb-4 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Video className="w-4 h-4 mr-2 text-indigo-500" />
                    <span className="font-medium mr-2">{schedule.meetingProvider}:</span>
                    {schedule.meetingLink ? (
                      <a href={schedule.meetingLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate flex-1 flex items-center">
                        <LinkIcon className="w-3 h-3 mx-1" /> Link
                      </a>
                    ) : 'No Link Provided'}
                  </div>

                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Time Slots</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {schedule.slots.map((slot: any) => (
                      <div key={slot._id} className={`p-2.5 rounded-xl border text-sm flex flex-col ${slot.status === 'Booked' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold flex items-center ${slot.status === 'Booked' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            <Clock className="w-3 h-3 mr-1 opacity-70" /> {slot.time}
                          </span>
                        </div>
                        {slot.status === 'Booked' ? (
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center">
                            <UserIcon className="w-3 h-3 mr-1" /> {slot.parentId?.name || 'Parent'}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Available</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Create Availability Schedule</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Class</label>
                <CustomSelect
                  value={newSchedule.classId}
                  onChange={(val) => setNewSchedule({...newSchedule, classId: val})}
                  options={classes?.map((c: any) => ({ value: c._id, label: `${c.name} - ${c.stream || 'General'}` })) || []}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <CustomDatePicker selected={newSchedule.date} onChange={(d) => setNewSchedule({...newSchedule, date: d || new Date()})} />
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input type="time" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white" value={newSchedule.startTime} onChange={e => setNewSchedule({...newSchedule, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input type="time" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white" value={newSchedule.endTime} onChange={e => setNewSchedule({...newSchedule, endTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                  <CustomSelect
                    value={newSchedule.slotDuration}
                    onChange={(val) => setNewSchedule({...newSchedule, slotDuration: val})}
                    options={[{value: '10', label: '10 min'}, {value: '15', label: '15 min'}, {value: '20', label: '20 min'}, {value: '30', label: '30 min'}]}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Mode</label>
                    <CustomSelect
                      value={newSchedule.meetingProvider}
                      onChange={(val) => setNewSchedule({...newSchedule, meetingProvider: val})}
                      options={[{value: 'In-Person', label: 'In-Person'}, {value: 'Manual', label: 'Manual Link'}, {value: 'Google Meet', label: 'Google Meet'}, {value: 'Zoom', label: 'Zoom'}]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Link (Optional)</label>
                    <input type="url" placeholder="https://..." className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white" value={newSchedule.meetingLink} onChange={e => setNewSchedule({...newSchedule, meetingLink: e.target.value})} disabled={newSchedule.meetingProvider === 'In-Person'} />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 px-4 border rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={createSchedule.isPending || !newSchedule.classId} className="flex-1 py-2.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors">Generate Slots</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
