import { useState, useEffect } from 'react';
import { tripService } from '../services/api';
import { Power, Map, MessageSquare, CheckCircle, Package } from 'lucide-react';

export default function DriverDashboard() {
    const [trips, setTrips] = useState([]);
    const [online, setOnline] = useState(true);
    const [stats] = useState({ earnings: 45000, tripsCount: 12 });

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const { data } = await tripService.getAll();
            setTrips(data.filter(t => t.status === 'PENDING' || t.status === 'ACCEPTED'));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold">Panel de Fletero</h2>
                    <p className="text-zinc-500">Administrá tus viajes y ganancias</p>
                </div>
                <button
                    onClick={() => setOnline(!online)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                    <Power size={20} /> {online ? 'En Línea' : 'Desconectado'}
                </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-6 mb-10">
                <div className="card bg-zinc-900 text-white">
                    <p className="text-zinc-400 text-xs font-bold uppercase">Mis Ganancias</p>
                    <p className="text-3xl font-black text-yellow-400">${stats.earnings.toLocaleString()}</p>
                </div>
                <div className="card">
                    <p className="text-zinc-500 text-xs font-bold uppercase">Viajes Hoy</p>
                    <p className="text-3xl font-black">4</p>
                </div>
                <div className="card">
                    <p className="text-zinc-500 text-xs font-bold uppercase">Calificación</p>
                    <p className="text-3xl font-black text-yellow-600">4.9 ★</p>
                </div>
                <div className="card">
                    <p className="text-zinc-500 text-xs font-bold uppercase">Km recorridos</p>
                    <p className="text-3xl font-black">128</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Package size={20} className="text-yellow-600" /> Viajes Disponibles
                    </h3>

                    {trips.length === 0 ? (
                        <div className="card text-center py-20 bg-zinc-100/50 border-dashed">
                            <p className="text-zinc-400">No hay viajes pendientes cerca de tu zona.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trips.map(trip => (
                                <div key={trip.id} className="card border-l-4 border-l-yellow-400">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-black bg-zinc-900 text-white px-2 py-0.5 rounded mr-2">NUEVO</span>
                                            <span className="text-zinc-500 text-sm">{Math.floor(Math.random() * 5) + 1} km de distancia</span>
                                        </div>
                                        <p className="text-2xl font-black text-yellow-600 italic">${trip.price}</p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5"></div>
                                                <div className="w-0.5 h-full bg-zinc-200 my-1 font-bold"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            </div>
                                            <div className="space-y-4 text-sm font-medium">
                                                <p className="truncate max-w-sm">{trip.originAddr}</p>
                                                <p className="truncate max-w-sm">{trip.destAddr}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="btn-primary flex-1">Aceptar Viaje</button>
                                        <button className="btn-secondary w-12 flex items-center justify-center p-0"><Map size={20} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="card">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <MessageSquare size={18} /> Chats Activos
                        </h4>
                        <p className="text-sm text-zinc-500">No tenés conversaciones abiertas en este momento.</p>
                    </div>

                    <div className="bg-yellow-400 p-6 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-black text-xl mb-1">¡Sorteo Semanal!</h4>
                            <p className="text-sm font-bold text-yellow-900 mb-4">Los 3 fleteros con más viajes ganan un tanque lleno.</p>
                            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Ver Ranking</span>
                        </div>
                        <Truck size={80} className="absolute -bottom-4 -right-4 text-yellow-300 -rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
