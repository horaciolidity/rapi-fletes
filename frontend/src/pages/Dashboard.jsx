import { Routes, Route } from 'react-router-dom';
import { useStore } from '../store/useStore';
import UserDashboard from './UserDashboard';
import DriverDashboard from './DriverDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
    const { user } = useStore();

    return (
        <div className="bg-zinc-50 min-h-[calc(100-72px)]">
            <Routes>
                {user?.role === 'USER' && <Route path="/" element={<UserDashboard />} />}
                {user?.role === 'DRIVER' && <Route path="/" element={<DriverDashboard />} />}
                {user?.role === 'ADMIN' && <Route path="/" element={<AdminDashboard />} />}
                <Route path="*" element={<div className="p-10 text-center">Cargando dashboard...</div>} />
            </Routes>
        </div>
    );
}
