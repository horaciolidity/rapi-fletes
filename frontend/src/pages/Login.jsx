import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { authService } from '../services/api';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { setUser, setToken } = useStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await authService.login(formData);
            setUser(data.user);
            setToken(data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6 py-12">
            <div className="card w-full max-w-md animate-fade-in shadow-2xl">
                <div className="text-center mb-8">
                    <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LogIn size={28} className="text-black" />
                    </div>
                    <h2 className="text-3xl font-bold">Bienvenido de nuevo</h2>
                    <p className="text-zinc-500 mt-2">Ingresá tus credenciales para continuar</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-1 cursor-pointer" htmlFor="email">Email</label>
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
                        <label className="block text-sm font-semibold mb-1 cursor-pointer" htmlFor="password">Contraseña</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><Lock size={18} /></span>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="input-field pl-10"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 text-lg mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Cargando...' : 'Entrar'}
                    </button>
                </form>

                <p className="text-center mt-8 text-zinc-500">
                    ¿No tenés cuenta? <Link to="/register" className="text-yellow-600 font-bold hover:underline">Registrate acá</Link>
                </p>
            </div>
        </div>
    );
}
