import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, DollarSign, Truck, Globe, Loader2, CheckCircle } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
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
                price_per_km: c.price_per_km
            })))
        }
    }, [categories])

    const handleSave = async () => {
        setSaving(true)
        setSuccess(false)

        try {
            // Save global settings
            await updateSetting('currency_symbol', localSettings.currency_symbol)

            // Save category prices
            for (const cat of localPrices) {
                await updateVehicleCategory(cat.id, {
                    base_price: parseFloat(cat.base_price),
                    price_per_km: parseFloat(cat.price_per_km)
                })
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
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
        <div className="min-h-screen bg-black pb-24 text-white">
            <div className="bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900 p-6">
                <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary-500" />
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">CONFIGURACIÓN</h1>
                </div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase italic">Control operativo y financiero</p>
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
                            <label className="text-[9px] font-black text-zinc-600 uppercase italic mb-2 block tracking-widest">Símbolo de Moneda</label>
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
                                        <label className="text-[8px] font-black text-zinc-600 uppercase italic mb-1 block">Bajada de Bandera</label>
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
                                        <label className="text-[8px] font-black text-zinc-600 uppercase italic mb-1 block">Precio por KM</label>
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
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Floating Save Button */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
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
        </div>
    )
}

export default AdminSettings
