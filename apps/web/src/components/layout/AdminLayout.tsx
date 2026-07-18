import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Menu, CalendarCheck, FileText, Bell, Search, Sparkles, ChevronRight, Megaphone, Wallet, Calendar, Sun, Moon, CalendarOff, Building2, BookMarked, Bus, FileBadge, MessageSquare } from 'lucide-react';
import SystemHealthWidget from './SystemHealthWidget';
import NotificationDropdown from './NotificationDropdown';
import { useSearch } from '../../hooks/useSystem';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const { data: searchResults, isLoading: isSearchLoading } = useSearch(searchQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'teacher', 'student'] },
    { name: 'Classes', href: '/classes', icon: BookOpen, roles: ['superadmin', 'admin', 'teacher'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['superadmin', 'admin'] },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck, roles: ['superadmin', 'admin', 'teacher'] },
    { name: 'Homework', href: '/homework', icon: FileText, roles: ['superadmin', 'admin', 'teacher', 'student'] },
    { name: 'Leaves', href: '/leaves', icon: CalendarOff, roles: ['superadmin', 'admin', 'principal', 'teacher', 'student'] },
    { name: 'Notices', href: '/notices', icon: Megaphone, roles: ['superadmin', 'admin', 'teacher', 'student'] },
    { name: 'Fees', href: '/fees', icon: Wallet, roles: ['superadmin', 'admin', 'student'] },
    { name: 'Chat', href: '/chat', icon: MessageSquare, roles: ['superadmin', 'admin', 'principal', 'teacher', 'student', 'parent'] },
    { name: 'Exams', href: '/exams', icon: FileBadge, roles: ['superadmin', 'admin', 'principal', 'teacher', 'student'] },
    { name: 'Documents', href: '/documents', icon: FileText, roles: ['superadmin', 'admin', 'principal'] },
    { name: 'PTM', href: '/ptm', icon: Users, roles: ['superadmin', 'admin', 'principal', 'teacher'] },
    { name: 'Timetable', href: '/timetable', icon: Calendar, roles: ['superadmin', 'admin', 'teacher', 'student'] },
    { name: 'Library', href: '/library', icon: BookMarked, roles: ['superadmin', 'admin', 'principal', 'teacher', 'student'] },
    { name: 'Transport', href: '/transport', icon: Bus, roles: ['superadmin', 'admin', 'principal', 'student'] },
    { name: 'Schools', href: '/schools', icon: Building2, roles: ['superadmin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['superadmin', 'admin'] },
  ];

  const navigation = allNavItems.filter(item => item.roles.includes(user.role));

  const filteredLinks = navigation.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      
      {/* Modern Premium Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-[88px]' : 'w-[280px]'} bg-slate-950 dark:bg-slate-900 text-slate-300 flex flex-col relative z-20 shadow-2xl transition-all duration-300 ease-in-out shrink-0`}>
        {/* Abstract Background Glow */}
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full translate-y-[-50%]"></div>
        
        <div className={`h-20 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-8'} border-b border-white/5 relative z-10 transition-all duration-300`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="animate-in fade-in duration-300 whitespace-nowrap overflow-hidden">
                <h1 className="font-bold text-xl text-white tracking-tight leading-none">EduSaaS</h1>
                <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">Pro Workspace</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 relative z-10 scrollbar-hide">
          <div className={`px-6 mb-4 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          </div>
          <nav className="px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`group flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-out relative overflow-hidden ${
                    isActive 
                      ? 'text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Active State Background Gradient */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-100 z-0"></div>
                  )}
                  
                  <item.icon className={`${!isSidebarCollapsed && 'mr-3.5'} h-[1.15rem] w-[1.15rem] shrink-0 relative z-10 transition-transform duration-300 ${
                    isActive ? 'text-white scale-110' : 'text-slate-500 group-hover:text-indigo-400 group-hover:scale-110'
                  }`} />
                  
                  {!isSidebarCollapsed && (
                    <span className="relative z-10 tracking-wide whitespace-nowrap overflow-hidden animate-in fade-in duration-300">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-md relative z-10 flex justify-center">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group w-full`}>
            <div className="flex items-center">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="ml-3 truncate max-w-[110px] animate-in fade-in duration-300">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize truncate">{user.role}</p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button 
                onClick={(e) => { e.preventDefault(); logout(); }} 
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-all active:scale-95 shrink-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        {/* Glassmorphic Header */}
        <header className="h-20 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 transition-all duration-300">
          <div 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </div>
          
          <div className="flex items-center space-x-6">
            <SystemHealthWidget />
            
            {/* Search Command Palette */}
            <div className="hidden md:flex relative group" ref={searchRef}>
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search students, classes, or pages..." 
                className="pl-10 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all w-72 shadow-inner relative z-10"
              />
              
              {/* Search Dropdown */}
              {isSearchOpen && searchQuery.length > 1 && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Database Results</p>
                    
                    {isSearchLoading ? (
                      <p className="text-sm text-slate-500 px-3 py-4 text-center">Searching...</p>
                    ) : searchResults && searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map(result => (
                          <button
                            key={result.id}
                            onClick={() => {
                              navigate('/dashboard'); // Simplification: route based on type in future
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-start px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/link text-left"
                          >
                            <div className="flex-1">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400">{result.title}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{result.type} &bull; {result.subtitle}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover/link:opacity-100 transition-opacity mt-1" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 px-3 py-4 text-center">No results found for "{searchQuery}".</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800 overflow-hidden"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className={`transition-transform duration-500 ${theme === 'dark' ? '-translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <Sun className="h-5 w-5" />
              </div>
              <div className={`absolute top-2 left-2 transition-transform duration-500 ${theme === 'light' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
                <Moon className="h-5 w-5" />
              </div>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
              </button>
              
              <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
