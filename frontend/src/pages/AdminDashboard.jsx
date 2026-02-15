import { Share2, Users, Truck, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
            <div className="mb-10">
                <h2 className="text-3xl font-bold">Panel Administrativo</h2>
                <p className="text-zinc-500">Control total de la plataforma Rapi Fletes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={<TrendingUp />} label="Ingresos Totales" value="$1.2M" color="bg-green-100 text-green-700" />
                <StatCard icon={<Users />} label="Usuarios" value="1,240" color="bg-blue-100 text-blue-700" />
                <StatCard icon={<Truck />} label="Fleteros Activos" value="85" color="bg-yellow-100 text-yellow-700" />
                <StatCard icon={<AlertCircle />} label="Viajes Pendientes" value="12" color="bg-red-100 text-red-700" />
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                <div className="card">
                    <h3 className="font-bold text-lg mb-6">Últimos Fleteros Registrados</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-zinc-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-200"></div>
                                    <div>
                                        <p className="font-bold text-sm">Fletero {i}</p>
                                        <p className="text-xs text-zinc-500">DNI: 34.XXX.XXX</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-yellow-600 border border-yellow-200 px-3 py-1 rounded-lg">Verificar</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="font-bold text-lg mb-6">Monitoreo de Comisiones</h3>
                    <p className="text-sm text-zinc-500 mb-6">La plataforma retiene un 15% por cada viaje completado.</p>
                    <div className="bg-zinc-50 p-6 rounded-2xl">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Este Mes</span>
                            <span className="text-sm font-bold">$185,400</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-yellow-400 h-full w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="card">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                {icon}
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-black">{value}</p>
        </div>
    );
}
