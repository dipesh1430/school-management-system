import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useUsers } from '../hooks/useUsers';
import { useFees } from '../hooks/useFees';
import { useNotices, useEvents } from '../hooks/useCommunication';
import { Users, GraduationCap, Wallet, TrendingUp, BellRing, Calendar as CalendarIcon, ArrowRight, Shield, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: users } = useUsers();
  const { data: fees } = useFees();
  const { data: notices } = useNotices();
  const { data: events } = useEvents();

  // Statistics calculations
  const studentsCount = users?.filter(u => u.role === 'student').length || 0;
  const teachersCount = users?.filter(u => u.role === 'teacher').length || 0;
  
  const totalRevenue = fees?.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0) || 0;
  const pendingDues = fees?.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0) || 0;

  // Recent 3 notices
  const recentNotices = notices?.slice(0, 3) || [];
  
  // Upcoming 3 events
  const upcomingEvents = events?.slice(0, 3) || [];

  // Chart Data
  const demographicData = [
    { name: 'Students', value: studentsCount, color: '#4f46e5' },
    { name: 'Teachers', value: teachersCount, color: '#9333ea' },
  ];

  const feeData = [
    { name: 'Collected', amount: totalRevenue, fill: '#16a34a' },
    { name: 'Pending', amount: pendingDues, fill: '#d97706' },
  ];

  return (
    <div className="pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back, {user?.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-indigo-100 max-w-xl">
              Here is what's happening at your institution today. You have {pendingDues > 0 ? 'pending fee collections' : 'no pending dues'} and {upcomingEvents.length} upcoming events this week.
            </p>
          </div>
          <div className="hidden md:flex h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30 shadow-inner">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Students</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{studentsCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Teaching Staff</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{teachersCount}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Collected Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">${totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Pending Dues</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">${pendingDues.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Demographics Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">User Demographics</h2>
            </div>
          </div>
          <div className="p-6 flex-1 min-h-[300px] w-full">
            {studentsCount === 0 && teachersCount === 0 ? (
              <div className="h-full flex items-center justify-center"><p className="text-slate-500 dark:text-slate-400">No users found.</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="px-6 pb-6 flex justify-center space-x-6">
            {demographicData.map((entry, index) => (
              <div key={index} className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Fees Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Fee Collection Overview</h2>
            </div>
          </div>
          <div className="p-6 flex-1 min-h-[300px] w-full">
            {totalRevenue === 0 && pendingDues === 0 ? (
              <div className="h-full flex items-center justify-center"><p className="text-slate-500 dark:text-slate-400">No fee data available.</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={feeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip 
                    cursor={{ fill: '#334155', opacity: 0.2 }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Notices */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Announcements</h2>
            </div>
            <Link to="/notices" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-colors">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="p-6 flex-1">
            {recentNotices.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No recent announcements.</p>
            ) : (
              <div className="space-y-4">
                {recentNotices.map(notice => (
                  <div key={notice._id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{notice.title}</h4>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{notice.audience}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{notice.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming Events</h2>
            </div>
            <Link to="/notices" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-colors">
              Full calendar <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="p-6 flex-1">
            {upcomingEvents.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No upcoming events.</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map(event => {
                  const startDate = new Date(event.startDate);
                  const month = startDate.toLocaleString('default', { month: 'short' });
                  const day = startDate.getDate();
                  return (
                    <div key={event._id} className="flex items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                      <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex flex-col items-center justify-center shrink-0 mr-4 border border-purple-100 dark:border-purple-800/50">
                        <span className="text-[10px] font-bold uppercase leading-none mb-1">{month}</span>
                        <span className="text-lg font-bold leading-none">{day}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{event.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{event.type}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
