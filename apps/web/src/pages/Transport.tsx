import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bus, MapPin, Users, Plus, UserPlus, Trash2 } from 'lucide-react';
import { useTransportRoutes, useCreateTransportRoute, useAssignStudentToRoute, useRemoveStudentFromRoute } from '../hooks/useTransport';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';

export default function Transport() {
  const { user } = useAuthStore();
  const { data: routes, isLoading: isRoutesLoading } = useTransportRoutes();
  const { data: users } = useUsers();
  
  const createRoute = useCreateTransportRoute();
  const assignStudent = useAssignStudentToRoute();
  const removeStudent = useRemoveStudentFromRoute();

  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);

  // New Route Form
  const [newRoute, setNewRoute] = useState({ routeName: '', vehicleNumber: '', driverName: '', driverPhone: '', stops: [{ name: '', pickupTime: '', dropTime: '' }] });
  
  // Assign Student Form
  const [assignData, setAssignData] = useState({ studentId: '', stopId: '' });

  const handleAddStop = () => {
    setNewRoute({ ...newRoute, stops: [...newRoute.stops, { name: '', pickupTime: '', dropTime: '' }] });
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    createRoute.mutate(newRoute, {
      onSuccess: () => {
        setShowAddRouteModal(false);
        setNewRoute({ routeName: '', vehicleNumber: '', driverName: '', driverPhone: '', stops: [{ name: '', pickupTime: '', dropTime: '' }] });
      }
    });
  };

  const handleAssignStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignModal) return;
    assignStudent.mutate({ id: showAssignModal, data: assignData }, {
      onSuccess: () => {
        setShowAssignModal(null);
        setAssignData({ studentId: '', stopId: '' });
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Transport Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage bus routes and student manifests.</p>
        </div>
        {user?.role !== 'student' && user?.role !== 'parent' && (
          <button
            onClick={() => setShowAddRouteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Route
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {isRoutesLoading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Loading routes...</div>
        ) : routes?.map((route: any) => (
          <div key={route._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Bus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{route.routeName}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Vehicle: {route.vehicleNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{route.driverName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{route.driverPhone}</p>
              </div>
            </div>

            {/* Stops */}
            <div className="mb-6 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Route Stops</p>
              <div className="space-y-2">
                {route.stops.map((stop: any, index: number) => (
                  <div key={stop._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold mr-3">{index + 1}</div>
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{stop.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Pick: {stop.pickupTime} &bull; Drop: {stop.dropTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Passenger Manifest */}
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <Users className="w-3 h-3 mr-1" /> Passenger Manifest ({route.assignedStudents.length})
                </p>
                {user?.role !== 'student' && user?.role !== 'parent' && (
                  <button 
                    onClick={() => setShowAssignModal(route._id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
                  >
                    <UserPlus className="w-3 h-3 mr-1" /> Assign Student
                  </button>
                )}
              </div>

              {route.assignedStudents.length > 0 && (
                <div className="max-h-40 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                  {route.assignedStudents.map((assignment: any) => {
                    const stop = route.stops.find((s:any) => s._id === assignment.stopId);
                    return (
                      <div key={assignment._id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{assignment.studentId?.name}</span>
                          <span className="text-[10px] text-slate-500 flex items-center mt-0.5">
                            <MapPin className="w-3 h-3 mr-1" /> {stop?.name || 'Unknown Stop'}
                          </span>
                        </div>
                        {user?.role !== 'student' && user?.role !== 'parent' && (
                          <button 
                            onClick={() => removeStudent.mutate({ id: route._id, data: { studentId: assignment.studentId?._id } })}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
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
        ))}
      </div>

      {/* Add Route Modal */}
      {showAddRouteModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Create Bus Route</h2>
            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Route Name</label>
                  <input type="text" required placeholder="e.g. Route A - North" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={newRoute.routeName} onChange={e => setNewRoute({...newRoute, routeName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Number</label>
                  <input type="text" required placeholder="e.g. MH12 AB 1234" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={newRoute.vehicleNumber} onChange={e => setNewRoute({...newRoute, vehicleNumber: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Name</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={newRoute.driverName} onChange={e => setNewRoute({...newRoute, driverName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Phone</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={newRoute.driverPhone} onChange={e => setNewRoute({...newRoute, driverPhone: e.target.value})} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Stops</label>
                  <button type="button" onClick={handleAddStop} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">+ Add Stop</button>
                </div>
                <div className="space-y-3">
                  {newRoute.stops.map((stop, index) => (
                    <div key={index} className="flex space-x-2 items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="w-6 text-center text-xs font-bold text-slate-400">{index + 1}</div>
                      <input type="text" placeholder="Location Name" required className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-900 dark:border-slate-700" value={stop.name} onChange={e => { const newStops = [...newRoute.stops]; newStops[index].name = e.target.value; setNewRoute({...newRoute, stops: newStops}); }} />
                      <input type="time" required className="w-24 px-2 py-1 text-sm border rounded dark:bg-slate-900 dark:border-slate-700" value={stop.pickupTime} onChange={e => { const newStops = [...newRoute.stops]; newStops[index].pickupTime = e.target.value; setNewRoute({...newRoute, stops: newStops}); }} />
                      <input type="time" required className="w-24 px-2 py-1 text-sm border rounded dark:bg-slate-900 dark:border-slate-700" value={stop.dropTime} onChange={e => { const newStops = [...newRoute.stops]; newStops[index].dropTime = e.target.value; setNewRoute({...newRoute, stops: newStops}); }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddRouteModal(false)} className="flex-1 py-2 px-4 border rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={createRoute.isPending} className="flex-1 py-2 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700">Create Route</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Assign Student Modal */}
      {showAssignModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Assign Student to Route</h2>
            <form onSubmit={handleAssignStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
                <select required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={assignData.studentId} onChange={e => setAssignData({...assignData, studentId: e.target.value})}>
                  <option value="">Select a student...</option>
                  {users?.filter((u:any) => u.role === 'student').map((u:any) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Stop</label>
                <select required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800" value={assignData.stopId} onChange={e => setAssignData({...assignData, stopId: e.target.value})}>
                  <option value="">Select a stop...</option>
                  {routes?.find((r:any) => r._id === showAssignModal)?.stops.map((stop:any) => (
                    <option key={stop._id} value={stop._id}>{stop.name} (Pick: {stop.pickupTime})</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAssignModal(null)} className="flex-1 py-2 px-4 border rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={assignStudent.isPending} className="flex-1 py-2 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
