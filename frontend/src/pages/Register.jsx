import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import { UserPlus, Mail, Lock, User as UserIcon, Truck } from 'lucide-react';

export default function Register() {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: searchParams.get('role') || 'USER',
        referredBy: searchParams.get('ref') || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6 py-12">
            <div className="card w-full max-w-md animate-fade-in shadow-2xl">
                <div className="text-center mb-8">
                    <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <UserPlus size={28} className="text-black" />
                    </div>
                    <h2 className="text-3xl font-bold">Unite a Rapi Fletes</h2>
                    <p className="text-zinc-500 mt-2">Creá tu cuenta en pocos segundos</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex bg-zinc-100 p-1 rounded-xl mb-4">
                        <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${formData.role === 'USER' ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
                            onClick={() => setFormData({ ...formData, role: 'USER' })}
                        >
                            <UserIcon size={18} /> Cliente
                        </button>
                        <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${formData.role === 'DRIVER' ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
                            onClick={() => setFormData({ ...formData, role: 'DRIVER' })}
                        >
                            <Truck size={18} /> Fletero
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="name">Nombre Completo</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><UserIcon size={18} /></span>
                            <input
                                id="name"
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                className="input-field pl-10"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="email">Email</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><Mail size={18} /></span>
                            <input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                className="input-field pl-10"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="password">Contraseña</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><Lock size={18} /></span>
                            <input
                                id="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                className="input-field pl-10"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 text-lg mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <p className="text-center mt-8 text-zinc-500">
                    ¿Ya tenés cuenta? <Link to="/login" className="text-yellow-600 font-bold hover:underline">Iniciá sesión</Link>
                </p>
            </div>
        </div>
    );
}
