import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Truck, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
    const { user, token, logout } = useStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50 border-b border-zinc-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-yellow-400 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                        <Truck size={24} className="text-black" />
                    </div>
                    <span className="text-xl font-black tracking-tighter">RAPI<span className="text-yellow-500">FLETES</span></span>
                </Link>

                <div className="flex items-center gap-4">
                    {!token ? (
                        <>
                            <Link to="/login" className="text-zinc-600 font-semibold hover:text-black">Entrar</Link>
                            <Link to="/register" className="btn-primary">Registrarse</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className="flex items-center gap-2 text-zinc-600 font-semibold hover:text-black">
                                <LayoutDashboard size={20} />
                                <span className="hidden sm:inline">Panel</span>
                            </Link>
                            <div className="h-6 w-px bg-zinc-200"></div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-sm font-bold leading-none">{user?.name}</span>
                                    <span className="text-xs text-zinc-500">{user?.role}</span>
                                </div>
                                <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 transition-colors">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
