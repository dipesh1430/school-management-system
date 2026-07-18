import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import Homework from './pages/Homework';
import Notices from './pages/Notices';
import Fees from './pages/Fees';
import Settings from './pages/Settings';
import Timetable from './pages/Timetable';
import LeaveManagement from './pages/LeaveManagement';
import Schools from './pages/Schools';
import Library from './pages/Library';
import Transport from './pages/Transport';
import Exams from './pages/Exams';
import PTM from './pages/PTM';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{ 
        className: 'text-sm font-medium',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      }} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="classes" element={<Classes />} />
            <Route path="users" element={<Users />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="homework" element={<Homework />} />
            <Route path="notices" element={<Notices />} />
            <Route path="fees" element={<Fees />} />
            <Route path="leaves" element={<LeaveManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="schools" element={<Schools />} />
            <Route path="library" element={<Library />} />
            <Route path="transport" element={<Transport />} />
            <Route path="exams" element={<Exams />} />
            <Route path="ptm" element={<PTM />} />
            <Route path="chat" element={<Chat />} />
            <Route path="documents" element={<Documents />} />
          </Route>
          
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
