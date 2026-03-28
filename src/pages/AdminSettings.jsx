import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, DollarSign, Truck, Globe, Loader2, CheckCircle, Bell, Send } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { notificationService } from '../services/notificationService'
import { useBookingStore } from '../store/useBookingStore'

const AdminSettings = () => {
    const { settings, fetchSettings, updateSetting, updateVehicleCategory } = useAdminStore()
    const { categories, fetchCategories } = useBookingStore()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    const [localSettings, setLocalSettings] = useState({
        currency_symbol: '$',
    })

    const [localPrices, setLocalPrices] = useState([])

    // Push Notification State
    const [pushData, setPushData] = useState({ title: '', body: '', role: 'all' })
    const [sendingPush, setSendingPush] = useState(false)
    const [pushStatus, setPushStatus] = useState(null)

    useEffect(() => {
        const load = async () => {
            const s = await fetchSettings()
            await fetchCategories()
            setLocalSettings(s)
            setLoading(false)
        }
        load()
    }, [])

    useEffect(() => {
        if (categories.length > 0) {
            setLocalPrices(categories.map(c => ({
                id: c.id,
                name: c.name,
                base_price: c.base_price,
                price_per_km: c.price_per_km,
                commission_rate: c.commission_rate || 10
            })))
        }
    }, [categories])

    const handleSave = async () => {
        setSaving(true)
        setSuccess(false)

        try {
            console.group('Admin Settings: Guardado Maestro Iniciado')

            // Save global settings
            console.log('1/2 Guardando moneda:', localSettings.currency_symbol)
            await updateSetting('currency_symbol', localSettings.currency_symbol)

            // Save category prices
            console.log('2/2 Guardando precios de categorías...')
            for (const cat of localPrices) {
                console.log(`Actualizando ${cat.name} (ID: ${cat.id})...`)
                await updateVehicleCategory(cat.id, {
                    base_price: parseFloat(cat.base_price),
                    price_per_km: parseFloat(cat.price_per_km),
                    commission_rate: parseFloat(cat.commission_rate)
                })
            }

            // RE-FETCH DATA to ensure UI is in sync
            console.log('Refrescando datos desde el servidor...')
            await fetchSettings()
            await fetchCategories()

            console.groupEnd()
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.groupEnd()
            console.error('Error al guardar:', err)
            alert('ERROR CRÍTICO AL GUARDAR: ' + (err.message || 'Error desconocido'))
        } finally {
            setSaving(false)
        }
    }

    const handleSendPush = async () => {
        if (!pushData.title || !pushData.body) return alert('Por favor, ingresa título y mensaje para la alerta.')
        if (!window.confirm(`¿Estás seguro de enviar esta alerta a ${pushData.role === 'all' ? 'todos' : pushData.role === 'driver' ? 'los choferes' : 'los clientes'}?`)) return
        
        setSendingPush(true)
        setPushStatus(null)

        const result = await notificationService.sendCustomBroadcast(pushData.title, pushData.body, pushData.role)
        
        setSendingPush(false)
        if (result.success) {
            setPushStatus(`✅ Alerta enviada con éxito (${result.count} entregadas)`)
            setPushData({ title: '', body: '', role: 'all' })
            setTimeout(() => setPushStatus(null), 5000)
        } else {
            setPushStatus(`❌ Error enviando alerta: ${result.error}`)
            setTimeout(() => setPushStatus(null), 10000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pb-48 text-white">
            <div className="bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900 p-6">
                <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary-500" />
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">CONFIGURACIÓN</h1>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase italic">Control operativo y financiero</p>
            </div>

            <div className="p-6 space-y-8 max-w-2xl mx-auto">
                {/* Global Config */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-primary-500" />
                        <h2 className="text-sm font-black uppercase italic tracking-widest">Regional & Visual</h2>
                    </div>
                    <div className="glass-card p-6 space-y-4">
                        <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase italic mb-2 block tracking-widest">Símbolo de Moneda</label>
                            <input
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-black italic text-white outline-none focus:border-primary-500/50"
                                value={localSettings.currency_symbol}
                                onChange={e => setLocalSettings({ ...localSettings, currency_symbol: e.target.value })}
                                placeholder="$"
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Config */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-primary-500" />
                        <h2 className="text-sm font-black uppercase italic tracking-widest">Tarifario por Categoría</h2>
                    </div>
                    <div className="space-y-4">
                        {localPrices.map((cat, idx) => (
                            <div key={cat.id} className="glass-card p-6 bg-zinc-900/40">
                                <div className="flex items-center gap-3 mb-4">
                                    <Truck className="w-5 h-5 text-primary-500" />
                                    <h3 className="font-black italic uppercase text-lg">{cat.name}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[8px] font-black text-zinc-400 uppercase italic mb-1 block">Bajada de Bandera</label>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-primary-500/50"
                                            value={cat.base_price}
                                            onChange={e => {
                                                const newPrices = [...localPrices]
                                                newPrices[idx].base_price = e.target.value
                                                setLocalPrices(newPrices)
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-zinc-400 uppercase italic mb-1 block">Precio por KM</label>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-primary-500/50"
                                            value={cat.price_per_km}
                                            onChange={e => {
                                                const newPrices = [...localPrices]
                                                newPrices[idx].price_per_km = e.target.value
                                                setLocalPrices(newPrices)
                                            }}
                                        />
                                    </div>

                                    <div className="col-span-2 mt-2">
                                        <label className="text-[8px] font-black text-primary-500 uppercase italic mb-1 block">Comisión de Plataforma (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="99"
                                                className="w-full bg-zinc-950 border border-primary-500/20 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-primary-500/50"
                                                value={cat.commission_rate}
                                                onChange={e => {
                                                    const newPrices = [...localPrices]
                                                    newPrices[idx].commission_rate = e.target.value
                                                    setLocalPrices(newPrices)
                                                }}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-500">%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Send Push Notifications Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-4 h-4 text-primary-500" />
                        <h2 className="text-sm font-black uppercase italic tracking-widest">Alertas Rápidas (Push Net)</h2>
                    </div>
                    <div className="glass-card p-6 space-y-4 border border-primary-500/20 bg-primary-500/5">
                        <p className="text-[10px] font-bold text-zinc-400 italic mb-2">Envía alertas personalizadas que sonarán en el teléfono aunque la app esté cerrada.</p>
                        
                        <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase italic mb-2 block tracking-widest">Audiencia Objetivo</label>
                            <select 
                                value={pushData.role}
                                onChange={e => setPushData({...pushData, role: e.target.value})}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-black italic text-white outline-none focus:border-primary-500/50"
                            >
                                <option value="all">A Todos (General HQ)</option>
                                <option value="driver">Solo Conductores (Red Operativa)</option>
                                <option value="client">Solo Clientes (Consumer Base)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase italic mb-2 block tracking-widest">Título de la Alerta</label>
                            <input
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-black italic text-white outline-none focus:border-primary-500/50"
                                value={pushData.title}
                                onChange={e => setPushData({ ...pushData, title: e.target.value })}
                                placeholder="Ej: ¡ALERTA ROJA CLIMA!"
                            />
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-zinc-400 uppercase italic mb-2 block tracking-widest">Cuerpo del Mensaje</label>
                            <textarea
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold italic text-white outline-none focus:border-primary-500/50 resize-none h-24"
                                value={pushData.body}
                                onChange={e => setPushData({ ...pushData, body: e.target.value })}
                                placeholder="Escribe el mensaje detallado aquí..."
                            />
                        </div>

                        <button 
                            onClick={handleSendPush}
                            disabled={sendingPush || !pushData.title || !pushData.body}
                            className="w-full mt-4 py-4 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest italic uppercase bg-red-600/20 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            {sendingPush ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {sendingPush ? 'Transmitiendo...' : 'DISPARAR ALERTA GLOBAL'}
                        </button>
                        
                        {pushStatus && (
                            <p className="text-[10px] text-center font-bold mt-2 text-white italic">{pushStatus}</p>
                        )}
                    </div>
                </section>
            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${success
                        ? 'bg-green-500 text-black'
                        : 'bg-primary-500 text-black shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:scale-[1.02]'
                        }`}
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : success ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            <span>CAMBIOS GUARDADOS</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>GUARDAR CONFIGURACIÓN</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default AdminSettings
