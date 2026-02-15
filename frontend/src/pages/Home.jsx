import { Link } from 'react-router-dom';
import { Truck, MapPin, Shield, Clock } from 'lucide-react';

export default function Home() {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative bg-zinc-900 text-white py-20 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-400 skew-x-12 translate-x-1/2 opacity-20 lg:opacity-100"></div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
                            Fletes <span className="text-yellow-400">Rápidos</span>,<br /> Viajes Seguros.
                        </h1>
                        <p className="text-zinc-400 text-xl mb-8 max-w-lg">
                            La plataforma líder para conectar dueños de fletes con clientes de forma instantánea. Precisión, velocidad y confianza en cada km.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register" className="btn-primary text-center px-8 py-4 text-lg">
                                Pedir un Flete
                            </Link>
                            <Link to="/register?role=DRIVER" className="btn-secondary text-center px-8 py-4 text-lg">
                                Quiero ser Fletero
                            </Link>
                        </div>
                    </div>

                    <div className="hidden lg:block relative">
                        {/* Simple visual representation of app dashboard or truck */}
                        <div className="bg-zinc-800 p-4 rounded-3xl border border-zinc-700 shadow-2xl scale-110">
                            <div className="bg-zinc-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-zinc-700">
                                <Truck size={120} className="text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">¿Por qué elegir Rapi Fletes?</h2>
                    <p className="text-zinc-500 text-lg">Tecnología de punta aplicada al transporte de carga.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card text-center">
                        <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Clock className="text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">En Tiempo Real</h3>
                        <p className="text-zinc-500">Seguí tu flete desde el mapa en vivo mientras se dirige a tu ubicación.</p>
                    </div>

                    <div className="card text-center">
                        <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield className="text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Seguridad Garantizada</h3>
                        <p className="text-zinc-500">Todos nuestros fleteros pasan por un proceso estricto de verificación.</p>
                    </div>

                    <div className="card text-center">
                        <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <MapPin className="text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Precio Dinámico</h3>
                        <p className="text-zinc-500">Costo exacto por km. Sin sorpresas ni regateos innecesarios.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-100 py-12 px-6 text-center border-t border-zinc-200">
                <p className="text-zinc-500 font-medium">© 2026 Rapi Fletes. Logística profesional al alcance de un click.</p>
            </footer>
        </div>
    );
}
