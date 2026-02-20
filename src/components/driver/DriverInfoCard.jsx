import React from 'react'
import { motion } from 'framer-motion'
import { Truck, Star, Award, Phone, MapPin } from 'lucide-react'

const DriverInfoCard = ({ driver, vehicle, averageRating, totalTrips }) => {
    // Si no hay chofer asignado, no mostrar nada
    if (!driver) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-zinc-900/50 border-zinc-800"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                {/* Avatar del chofer */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-400 rounded-2xl border-2 border-primary-500 flex items-center justify-center overflow-hidden shadow-lg shadow-primary-500/20">
                    {driver.avatar_url ? (
                        <img src={driver.avatar_url} alt={driver.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <Truck className="w-8 h-8 text-black" />
                    )}
                </div>

                {/* Nombre y verificación */}
                <div className="flex-1">
                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5 italic">Tu conductor asignado</p>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">
                        {driver.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Award className="w-3 h-3 text-primary-500" />
                        <p className="text-[9px] font-black text-primary-500 uppercase italic">
                            Conductor Verificado
                        </p>
                    </div>
                </div>

                {/* Calificación */}
                <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                        <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
                        <span className="text-xl font-black text-white italic">
                            {(averageRating || 5.0).toFixed(1)}
                        </span>
                    </div>
                    <p className="text-[8px] font-bold text-zinc-600 uppercase italic">
                        {totalTrips || 0} viajes
                    </p>
                </div>
            </div>

            {/* Información del vehículo */}
            {vehicle && (
                <div className="space-y-3 mb-4">
                    <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5">
                        <p className="text-[8px] font-black text-zinc-600 uppercase mb-2 italic">
                            Vehículo
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase">
                                    Marca/Modelo
                                </p>
                                <p className="text-[11px] font-black text-white italic uppercase">
                                    {vehicle.brand} {vehicle.model}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase">
                                    Patente
                                </p>
                                <p className="text-[11px] font-black text-white italic uppercase">
                                    {vehicle.license_plate}
                                </p>
                            </div>
                            {vehicle.color && (
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">
                                        Color
                                    </p>
                                    <p className="text-[11px] font-black text-white italic uppercase">
                                        {vehicle.color}
                                    </p>
                                </div>
                            )}
                            {vehicle.year && (
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">
                                        Año
                                    </p>
                                    <p className="text-[11px] font-black text-white italic uppercase">
                                        {vehicle.year}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Botón de contacto */}
            <a
                href={`tel:${driver.phone}`}
                className="premium-button w-full flex items-center justify-center gap-3 text-xs py-4"
            >
                <Phone className="w-5 h-5" />
                CONTACTAR CHOFER
            </a>
        </motion.div>
    )
}

export default DriverInfoCard
