import { useState, useEffect } from 'react';
import { tripService } from '../services/api';
import { MapPin, Search, Navigation, DollarSign, Clock } from 'lucide-react';

export default function UserDashboard() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [form, setForm] = useState({
        origin: '',
        destination: '',
        estimatedPrice: 0,
        distance: 0
    });

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const { data } = await tripService.getAll();
            setTrips(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (e) => {
        e.preventDefault();
        // In a real app, we would use Mapbox/Google to get coordinates and distance
        try {
            await tripService.create({
                originAddr: form.origin,
                originLat: -34.6037, // Sample BA
                originLng: -58.3816,
                destAddr: form.destination,
                destLat: -34.6137,
                destLng: -58.3916,
                distance: 5.5,
                duration: 20,
                price: 5000 + (5.5 * 500), // Simple algorithm $500/km
            });
            setShowRequestForm(false);
            loadTrips();
        } catch (err) {
            alert('Error al crear el flete');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold">Mi Actividad</h2>
                    <p className="text-zinc-500">Gestioná tus envíos y pedidos</p>
                </div>
                <button
                    onClick={() => setShowRequestForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Search size={20} /> Nuevo Pedido
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-zinc-400" /> Historial Reciente
                    </h3>

                    {loading ? (
                        <div className="p-12 text-center text-zinc-400">Cargando viajes...</div>
                    ) : trips.length === 0 ? (
                        <div className="card text-center py-20">
                            <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Navigation size={24} className="text-zinc-400" />
                            </div>
                            <p className="text-zinc-500">No tenés viajes registrados aún.</p>
                            <button onClick={() => setShowRequestForm(true)} className="text-yellow-600 font-bold mt-2">Pedir mi primer flete</button>
                        </div>
                    ) : (
                        trips.map(trip => (
                            <div key={trip.id} className="card flex items-center justify-between hover:border-yellow-200 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${trip.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold truncate max-w-[150px]">{trip.destAddr}</span>
                                            <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full font-medium">{trip.status}</span>
                                        </div>
                                        <p className="text-sm text-zinc-500">{new Date(trip.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">${trip.price}</p>
                                    <p className="text-xs text-zinc-400">{trip.distance} km</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-6">
                    <div className="card bg-zinc-900 text-white border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h4 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Total Invertido</h4>
                        <p className="text-4xl font-black text-yellow-400">${trips.reduce((acc, t) => acc + t.price, 0).toLocaleString()}</p>
                        <div className="mt-8 flex items-center gap-2 text-zinc-400 text-sm">
                            <Shield size={14} /> Pagos protegidos por Mercado Pago
                        </div>
                    </div>

                    <div className="card">
                        <h4 className="font-bold mb-4">Referí y Ganá</h4>
                        <p className="text-sm text-zinc-500 mb-4">Compartí tu código y obtené un 10% de descuento en tu próximo viaje.</p>
                        <div className="bg-zinc-50 p-3 rounded-lg border border-dashed border-zinc-300 flex justify-between items-center">
                            <span className="font-mono font-bold">REF12345</span>
                            <button className="text-yellow-600 text-xs font-bold uppercase">Copiar</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form Placeholder */}
            {showRequestForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="card w-full max-w-xl animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Nuevo Flete</h3>
                            <button onClick={() => setShowRequestForm(false)} className="text-zinc-400">✕</button>
                        </div>

                        <form onSubmit={handleRequest} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><MapPin size={16} className="text-red-500" /> Origen</label>
                                <input
                                    type="text"
                                    placeholder="Calle y altura"
                                    className="input-field"
                                    required
                                    value={form.origin}
                                    onChange={e => setForm({ ...form, origin: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2"><MapPin size={16} className="text-green-500" /> Destino</label>
                                <input
                                    type="text"
                                    placeholder="Calle y altura"
                                    className="input-field"
                                    required
                                    value={form.destination}
                                    onChange={e => setForm({ ...form, destination: e.target.value })}
                                />
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-yellow-700 font-bold uppercase">Precio Estimado</p>
                                    <p className="text-2xl font-black text-yellow-800">$7,500</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-yellow-700 font-bold uppercase">Distancia</p>
                                    <p className="text-zinc-600 font-bold">12.4 km</p>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full py-4 text-lg">
                                Confirmar Pedido
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
