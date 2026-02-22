import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, MapPin, Navigation, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Phone, DollarSign, ShieldCheck, Car, FileText, Upload, AlertTriangle, ChevronRight, Target, Map as MapIcon, Info, History, Activity, ChevronLeft, User, Search, X, MessageSquare } from 'lucide-react'
import { useDriverStore } from '../store/useDriverStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { useNavigate } from 'react-router-dom'
import FreightMap from '../components/map/FreightMap'
import ChatWidget from '../components/chat/ChatWidget'
import TripStopwatch from '../components/trip/TripStopwatch'
import TripTimer from '../components/trip/TripTimer'
import RatingModal from '../components/trip/RatingModal'
import { supabase } from '../api/supabase'

const DriverDashboard = () => {
    const { user, profile, updateProfile, fetchProfile } = useAuthStore()
    const { availableFletes, activeFlete, loading: storeLoading, fetchAvailableFletes, fetchActiveFlete, acceptFlete, updateFleteStatus, subscribeToNewFletes, fetchDriverHistory } = useDriverStore()
    const navigate = useNavigate()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFleteId, setSelectedFleteId] = useState(null)
    const [completedHistory, setCompletedHistory] = useState([])
    const [activeTab, setActiveTab] = useState('marketplace') // marketplace, active, garage, history
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [showAddVehicle, setShowAddVehicle] = useState(false)
    const [categories, setCategories] = useState([])
    const [completedTripId, setCompletedTripId] = useState(null)
    const [showPassengerConfirm, setShowPassengerConfirm] = useState(false)
    const [showChatTutorial, setShowChatTutorial] = useState(false)
    const [isInternalNav, setIsInternalNav] = useState(false)
    const { requestPermission } = useNotificationStore()
    const [driverLatLng, setDriverLatLng] = useState(null)
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        license_plate: '',
        category_id: '',
        justification: '',
        phone: ''
    })

    const { vehicles, fetchMyVehicles, addVehicle, setActiveVehicle } = useDriverStore()

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }
        fetchProfile(user.id)
        requestPermission() // Ensure browser notification permission is asked
    }, [user])

    useEffect(() => {
        if (profile?.role !== 'driver' && profile?.role !== 'admin') {
            if (profile && profile.role !== 'admin') navigate('/')
        }
    }, [profile?.role])

    useEffect(() => {
        if (profile?.role === 'driver' || profile?.role === 'admin') {
            // Fetch categories for forms
            supabase.from('vehicle_categories').select('*').order('id').then(({ data }) => setCategories(data || []))

            if (user?.id) {
                fetchMyVehicles(user.id)
            }
        }
    }, [profile?.role, user?.id])

    useEffect(() => {
        if (profile?.verification_status === 'verified' || profile?.verification_status === 'pending') {
            fetchAvailableFletes(user.id)
            fetchActiveFlete(user.id)
            fetchDriverHistory(user.id).then(setCompletedHistory)

            const channel = subscribeToNewFletes()
            return () => {
                if (channel) channel.unsubscribe()
            }
        }
    }, [profile?.verification_status, user?.id])

    useEffect(() => {
        let watchId = null
        if (profile?.verification_status === 'verified' && activeFlete) {
            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords
                        setDriverLatLng({ lat: latitude, lng: longitude })
                        useDriverStore.getState().updateLocation(user.id, latitude, longitude)
                    },
                    (err) => console.error("Error watching location", err),
                    { enableHighAccuracy: true, distanceFilter: 10 }
                )
            }
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [activeFlete, profile?.verification_status, user?.id])

    useEffect(() => {
        if (activeFlete) {
            setActiveTab('active')

            // Automatic Navigation logic
            const lastStatus = localStorage.getItem('last_flete_status')
            if (lastStatus !== activeFlete.status) {
                // If status changed, we can trigger auto-nav
                if (activeFlete.status === 'accepted') {
                    // Just accepted, navigate to pickup
                    // We don't auto-open window here to avoid browser blocking popups
                    // But we could if we wanted. Better to let the first user action trigger it.
                }
                localStorage.setItem('last_flete_status', activeFlete.status)
            }
        } else {
            setIsInternalNav(false)
            localStorage.removeItem('last_flete_status')
            setShowChatTutorial(false)
        }
    }, [activeFlete?.status, activeFlete?.id])

    // Trigger Chat Tutorial when flete is accepted
    useEffect(() => {
        if (activeFlete?.status === 'accepted') {
            const hasSeen = localStorage.getItem(`tutorial_chat_${activeFlete.id}`)
            if (!hasSeen) {
                setShowChatTutorial(true)
            }
        }
    }, [activeFlete?.status])

    const openGoogleMaps = (lat, lng, label = '') => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
        window.open(url, '_blank')
    }

    const openFullRoute = () => {
        if (!activeFlete) return
        const url = `https://www.google.com/maps/dir/?api=1&destination=${activeFlete.dropoff_lat},${activeFlete.dropoff_lng}&waypoints=${activeFlete.pickup_lat},${activeFlete.pickup_lng}&travelmode=driving`
        window.open(url, '_blank')
    }

    const handleAddVehicle = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const vehicleData = {
            brand: formData.brand.toUpperCase(),
            model: formData.model.toUpperCase(),
            year: parseInt(formData.year),
            license_plate: formData.license_plate.toUpperCase(),
            category_id: parseInt(formData.category_id),
            justification: formData.justification
        }

        const res = await addVehicle(user.id, vehicleData)
        if (res) {
            setShowAddVehicle(false)
            setFormData({ ...formData, brand: '', model: '', year: '', license_plate: '', justification: '' })

            // Si es la primera vez (estado none), actualizamos perfil a pending
            if (profile.verification_status === 'none') {
                await updateProfile(user.id, {
                    phone: formData.phone,
                    verification_status: 'pending'
                })
                fetchProfile(user.id)
            }
        }
        setIsSubmitting(false)
    }

    const handleSwitchVehicle = async (vehicleId) => {
        const success = await setActiveVehicle(user.id, vehicleId)
        if (success) {
            fetchProfile(user.id)
            setActiveTab('marketplace')
        }
    }

    const handleAccept = async (id) => {
        const flete = availableFletes.find(f => f.id === id)
        await acceptFlete(id, user.id)
        setSelectedFleteId(null)
        setActiveTab('active')
    }


    const handleStatusChange = async (id, status) => {
        // Special handling for arrived_pickup - show passenger confirmation
        if (status === 'arrived_pickup') {
            setShowPassengerConfirm(true)
            return
        }

        // Special handling for completed - show rating modal
        if (status === 'completed') {
            await updateFleteStatus(id, status)
            setCompletedTripId(id)
            setShowRatingModal(true)
            fetchDriverHistory(user.id).then(setCompletedHistory)
            return
        }

        // Normal status updates
        const updated = await updateFleteStatus(id, status)

        // Auto-navigate to dropoff when starting trip
        if (status === 'in_transit' && updated) {
            openGoogleMaps(updated.dropoff_lat, updated.dropoff_lng)
        }
    }

    const handlePassengerConfirmation = async (passengerTravels) => {
        if (!activeFlete) return

        try {
            // Update passenger status
            await useDriverStore.getState().updatePassengerStatus(activeFlete.id, passengerTravels)

            // Update to arrived_pickup status
            await updateFleteStatus(activeFlete.id, 'arrived_pickup')

            // Close modal
            setShowPassengerConfirm(false)

            // Force refresh the active flete to show updated buttons
            const { data } = await supabase
                .from('fletes')
                .select('*, profiles(*), vehicle_categories(*)')
                .eq('id', activeFlete.id)
                .maybeSingle()

            if (data) {
                useDriverStore.setState({ activeFlete: data })
            }
        } catch (error) {
            console.error('Error confirming passenger:', error)
            setShowPassengerConfirm(false)
        }
    }

    const handleRatingSubmit = async ({ rating, notes }) => {
        if (!completedTripId) return

        await useDriverStore.getState().submitDriverRating(completedTripId, rating, notes)
        setShowRatingModal(false)
        setCompletedTripId(null)
        setActiveTab('marketplace')
    }

    const currentFlete = activeFlete || availableFletes.find(f => f.id === selectedFleteId)

    // Dynamic Map Points for Navigation
    const getMapPoints = () => {
        if (!activeFlete || !isInternalNav) {
            return {
                pickup: currentFlete ? { address: currentFlete.pickup_address, lat: currentFlete.pickup_lat, lng: currentFlete.pickup_lng } : null,
                dropoff: currentFlete ? { address: currentFlete.dropoff_address, lat: currentFlete.dropoff_lat, lng: currentFlete.dropoff_lng } : null
            }
        }

        // NAVIGATION MODE
        // Use local state tracked location
        const start = driverLatLng

        // If accepted but not arrived, navigate to pickup
        if (activeFlete.status === 'accepted') {
            return {
                pickup: start ? { ...start, address: 'Tu Ubicación' } : null, // If null, RoutingMachine won't render
                dropoff: { address: activeFlete.pickup_address, lat: activeFlete.pickup_lat, lng: activeFlete.pickup_lng }
            }
        }

        // If in transit, navigate to dropoff
        return {
            pickup: start ? { ...start, address: 'Tu Ubicación' } : { address: activeFlete.pickup_address, lat: activeFlete.pickup_lat, lng: activeFlete.pickup_lng },
            dropoff: { address: activeFlete.dropoff_address, lat: activeFlete.dropoff_lat, lng: activeFlete.dropoff_lng }
        }
    }

    const { pickup: mapPickup, dropoff: mapDropoff } = getMapPoints()

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    )

    if (profile.verification_status === 'none') {
        return (
            <div className="pb-24 pt-10 min-h-screen bg-black font-sans px-6">
                <div className="max-w-md mx-auto py-10">
                    <header className="mb-10">
                        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                            <Car className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">REGISTRO<br /><span className="text-primary-500">CONDUCTOR</span></h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase italic mt-4">Completa los datos de tu primer vehículo para comenzar.</p>
                    </header>
                    <form onSubmit={handleAddVehicle} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">Marca</label>
                                <input className="input-field py-4" placeholder="EJ: FORD" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">Modelo</label>
                                <input className="input-field py-4" placeholder="EJ: F100" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">Año</label>
                                <input type="number" className="input-field py-4" placeholder="2020" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">Patente</label>
                                <input className="input-field py-4 uppercase" placeholder="ABC-123" value={formData.license_plate} onChange={e => setFormData({ ...formData, license_plate: e.target.value })} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">Categoría del Vehículo</label>
                            <select
                                className="input-field py-4 bg-zinc-900 border-white/5 text-white"
                                value={formData.category_id}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                required
                            >
                                <option value="">Selecciona una categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">¿Por qué aplica a esta categoría?</label>
                            <textarea
                                className="input-field py-4 min-h-[80px] resize-none"
                                placeholder="Ej: Mi camioneta tiene caja extendida ideal para fletes medianos..."
                                value={formData.justification}
                                onChange={e => setFormData({ ...formData, justification: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 italic">WhatsApp de contacto</label>
                            <input className="input-field py-4" placeholder="+54 9 11 ..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="premium-button w-full py-5">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'ENVIAR SOLICITUD'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    const NavigationControls = ({
        activeFlete,
        onExit,
        onStatusChange,
        handlePassengerConfirmation
    }) => {
        return (
            <div className="fixed inset-x-0 bottom-4 z-[5000] pointer-events-auto px-4">
                {/* Floating Navigation Card - Smaller & Centered */}
                <div className="bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] safe-area-bottom w-full max-w-sm mx-auto">
                    {/* Compact Drag Handle */}
                    <div className="w-8 h-1 bg-zinc-700/50 rounded-full mx-auto mb-3" />

                    {/* Trip Info Header - Very Compact */}
                    <div className="flex justify-between items-center mb-3 px-1">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="bg-primary-500 text-black text-[9px] font-black px-1 rounded leading-none py-0.5">
                                    {activeFlete.estimated_duration || '25'}m
                                </div>
                                <span className="text-zinc-500 font-bold text-[9px] uppercase">{activeFlete.distance || '--'}km</span>
                            </div>
                            <h3 className="text-[11px] font-black text-white italic uppercase tracking-tight truncate">
                                {activeFlete.status === 'accepted' ? activeFlete.pickup_address : activeFlete.dropoff_address}
                            </h3>
                        </div>

                        <button
                            onClick={onExit}
                            className="bg-black/50 text-white px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 hover:bg-zinc-900 transition-colors"
                        >
                            <span className="text-[8px] font-black uppercase">SALIR</span>
                            <X className="w-3 h-3" />
                        </button>
                    </div>

                    {/* ACTION BUTTON AREA - Extra Compact */}
                    <div className="space-y-1.5">
                        {activeFlete.status === 'accepted' && (
                            <div className="space-y-1.5">
                                <button
                                    onClick={() => openGoogleMaps(activeFlete.pickup_lat, activeFlete.pickup_lng)}
                                    className="w-full py-3 bg-primary-500 text-black text-sm font-black uppercase rounded-xl shadow-lg hover:bg-primary-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Navigation className="w-4 h-4" />
                                    <span>Ir a Punto de Origen</span>
                                </button>
                                <button
                                    onClick={() => onStatusChange(activeFlete.id, 'arrived_pickup')}
                                    className="w-full py-3 bg-[#276EF1] text-white text-sm font-black uppercase rounded-xl shadow-lg hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span>Llegué al Origen</span>
                                </button>
                            </div>
                        )}

                        {activeFlete.status === 'arrived_pickup' && (
                            <button
                                onClick={() => onStatusChange(activeFlete.id, 'in_transit')}
                                className="w-full py-3 bg-[#05A357] text-white text-sm font-black uppercase rounded-xl shadow-lg hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Navigation className="w-4 h-4" />
                                <span>Iniciar Viaje</span>
                            </button>
                        )}

                        {activeFlete.status === 'in_transit' && (
                            <button
                                onClick={() => onStatusChange(activeFlete.id, 'arrived_dropoff')}
                                className="w-full py-3 bg-zinc-800 text-white text-sm font-black uppercase rounded-xl shadow-lg border border-white/10 hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Target className="w-4 h-4" />
                                <span>Llegué al Destino</span>
                            </button>
                        )}

                        {activeFlete.status === 'arrived_dropoff' && (
                            <button
                                onClick={() => onStatusChange(activeFlete.id, 'completed')}
                                className="w-full py-3 bg-[#05A357] text-white text-sm font-black uppercase rounded-xl shadow-lg hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Finalizar Viaje</span>
                            </button>
                        )}

                        {/* Secondary Action: Call Client & External Nav - Smaller footprint */}
                        <div className="flex gap-2 pt-2">
                            <a
                                href={`tel:${activeFlete.profiles?.phone || ''}`}
                                className="flex-1 flex items-center justify-center py-3 bg-zinc-900/50 border border-white/5 rounded-xl text-zinc-500 font-bold text-[10px] uppercase hover:text-white transition-colors"
                            >
                                <Phone className="w-3 h-3 mr-2 text-zinc-600" />
                                Llamar
                            </a>
                            <button
                                onClick={() => openGoogleMaps(activeFlete.status === 'accepted' ? activeFlete.pickup_lat : activeFlete.dropoff_lat, activeFlete.status === 'accepted' ? activeFlete.pickup_lng : activeFlete.dropoff_lng)}
                                className="flex-1 flex items-center justify-center py-3 bg-zinc-900/50 border border-white/5 rounded-xl text-zinc-500 font-bold text-[10px] uppercase hover:text-white transition-colors"
                            >
                                <Navigation className="w-3 h-3 mr-2 text-primary-500" />
                                Maps
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (profile.verification_status === 'pending') {
        return (
            <div className="pb-24 pt-10 min-h-screen bg-black font-sans px-6 flex flex-col items-center justify-center text-center">
                <Clock className="w-12 h-12 text-primary-500 animate-spin-slow mb-6" />
                <h2 className="text-3xl font-black italic uppercase text-white mb-2">AUDITORÍA<br />EN CURSO</h2>
                <p className="text-[11px] text-zinc-600 font-bold uppercase italic tracking-widest leading-relaxed max-w-xs">Estamos verificando tus datos. Te notificaremos pronto.</p>
                <button onClick={() => fetchProfile(user.id)} className="mt-10 text-primary-500 text-[10px] font-black uppercase underline italic tracking-widest">ACTUALIZAR ESTADO</button>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-sans">
            {/* Background Map */}
            <div className="absolute inset-0 z-0">
                <FreightMap
                    pickup={mapPickup}
                    dropoff={mapDropoff}
                    autoDetectLocation={true}
                    showActiveDrivers={false}
                    isNavigating={isInternalNav}
                />
            </div>

            {/* Overlays */}
            <div className={`relative z-10 h-full flex flex-col pointer-events-none transition-all duration-500 ${isInternalNav ? 'opacity-0' : 'opacity-100'}`}>
                {/* --- STANDARD DASHBOARD UI --- */}
                {!isInternalNav && (
                    <>
                        {/* Header Overlay */}
                        <div className="pt-16 px-6 pointer-events-auto transition-all">
                            <div className="max-w-md mx-auto flex justify-between items-center">
                                <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl p-4 rounded-3xl border border-[var(--border-color)]">
                                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-color)] leading-none">PANEL<br /><span className="text-primary-500">CHOFER</span></h1>
                                </div>
                                <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl p-4 rounded-3xl border border-[var(--border-color)] text-right">
                                    <p className="text-[8px] font-black text-zinc-500 uppercase italic leading-none mb-1">COMPLETADOS</p>
                                    <p className="text-xl font-black text-[var(--text-color)] italic leading-none">{completedHistory.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area - SCROLLABLE but allows click-through to map */}
                        <div className={`flex-grow overflow-y-auto px-4 pointer-events-none pb-32 transition-all duration-500 ${isInternalNav ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="max-w-md mx-auto w-full space-y-4 pt-4">

                                {/* Tab Switcher (Floating) */}
                                <div className={`flex bg-[var(--card-bg)]/90 backdrop-blur-3xl p-1 rounded-2xl border border-[var(--border-color)] mb-2 shadow-2xl pointer-events-auto transition-all ${isInternalNav ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100'}`}>
                                    {[
                                        { id: 'marketplace', label: 'PEDIDOS', icon: Truck },
                                        { id: 'active', label: 'ACTUAL', icon: Activity },
                                        { id: 'garage', label: 'GARAJE', icon: Car },
                                        { id: 'history', label: 'VIAJES', icon: History }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-zinc-600 hover:text-white'}`}
                                        >
                                            <tab.icon className="w-4 h-4 mb-1" />
                                            <span className="text-[8px] font-black uppercase tracking-tight">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === 'marketplace' && (
                                        <motion.div
                                            key="market"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 20, opacity: 0 }}
                                            className="max-h-[50vh] overflow-y-auto space-y-3 pb-4 scrollbar-none pointer-events-auto"
                                        >
                                            {!profile.active_vehicle_id ? (
                                                <div className="text-center py-20 bg-black/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 px-6">
                                                    <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-primary-500" />
                                                    <p className="text-[10px] font-black uppercase italic tracking-widest text-white mb-2">SIN VEHÍCULO ACTIVO</p>
                                                    <p className="text-[9px] text-zinc-500 uppercase font-black">Selecciona un vehículo en tu GARAJE para ver pedidos disponibles.</p>
                                                    <button onClick={() => setActiveTab('garage')} className="mt-6 text-primary-500 text-[10px] font-black uppercase underline italic">IR AL GARAJE</button>
                                                </div>
                                            ) : availableFletes.length > 0 ? availableFletes.map((flete, idx) => (
                                                <motion.div
                                                    key={flete.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => setSelectedFleteId(flete.id === selectedFleteId ? null : flete.id)}
                                                    className={`glass-card p-5 border-white/5 bg-black/90 backdrop-blur-3xl transition-all cursor-pointer pointer-events-auto ${selectedFleteId === flete.id ? 'border-primary-500/50 ring-2 ring-primary-500/20' : ''}`}
                                                >
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${selectedFleteId === flete.id ? 'bg-primary-500 text-black' : 'bg-zinc-900 text-zinc-700'}`}>
                                                                <Truck className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">NUEVO PEDIDO</span>
                                                        </div>
                                                        <p className="text-xl font-black text-primary-500 italic">$ {flete.estimated_price}</p>
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <MapPin className="w-3 h-3 text-primary-500 shrink-0" />
                                                            <p className="text-[10px] font-bold text-white truncate italic uppercase">{flete.pickup_address}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Navigation className="w-3 h-3 text-secondary-500 shrink-0" />
                                                            <p className="text-[10px] font-bold text-zinc-500 truncate italic uppercase">{flete.dropoff_address}</p>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {selectedFleteId === flete.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="space-y-4 mb-4"
                                                        >
                                                            {/* Stats Grid */}
                                                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                                                                <div className="bg-zinc-900/50 px-2 py-2 rounded-xl text-center">
                                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">DISTANCIA</p>
                                                                    <p className="text-[10px] font-black text-white italic">{flete.distance} km</p>
                                                                </div>
                                                                <div className="bg-zinc-900/50 px-2 py-2 rounded-xl text-center">
                                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">DURACIÓN</p>
                                                                    <p className="text-[10px] font-black text-white italic">{flete.duration} min</p>
                                                                </div>
                                                                <div className="bg-zinc-900/50 px-2 py-2 rounded-xl text-center">
                                                                    <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">VEHÍCULO</p>
                                                                    <p className="text-[9px] font-black text-white italic truncate">{flete.vehicle_categories?.name || 'N/A'}</p>
                                                                </div>
                                                            </div>

                                                            {/* Client Info */}
                                                            {flete.profiles && (
                                                                <div className="bg-primary-500/5 p-3 rounded-xl border border-primary-500/10">
                                                                    <p className="text-[7px] font-black text-primary-500 uppercase mb-1">CLIENTE</p>
                                                                    <p className="text-[10px] font-bold text-white italic uppercase">{flete.profiles.full_name}</p>
                                                                </div>
                                                            )}

                                                            {/* Shipment Details */}
                                                            {flete.shipment_details && (
                                                                <div className="bg-secondary-500/5 p-3 rounded-xl border border-secondary-500/10">
                                                                    <p className="text-[7px] font-black text-secondary-500 uppercase mb-1">DETALLES DE CARGA</p>
                                                                    <p className="text-[9px] font-bold text-zinc-300 italic uppercase leading-tight">{flete.shipment_details}</p>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}

                                                    {selectedFleteId === flete.id && (
                                                        <motion.button
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            onClick={(e) => { e.stopPropagation(); handleAccept(flete.id); }}
                                                            className="premium-button w-full py-4 text-[11px]"
                                                        >
                                                            ACEPTAR VIAJE
                                                        </motion.button>
                                                    )}
                                                </motion.div>
                                            )) : (
                                                <div className="text-center py-20 bg-black/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
                                                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-zinc-800" />
                                                    <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-700">BUSCANDO PEDIDOS...</p>
                                                    <p className="text-[8px] text-zinc-600 uppercase font-black mt-2">Categoría: {vehicles.find(v => v.id === profile.active_vehicle_id)?.vehicle_categories?.name}</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'active' && (
                                        <motion.div key="active" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="pointer-events-auto">
                                            {activeFlete ? (
                                                <div className="space-y-4">
                                                    {/* Primary Status Action Button */}
                                                    <div className="bg-black/60 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-4">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                                            <span className="text-[11px] font-black text-primary-500 uppercase italic tracking-widest">PRÓXIMO PASO</span>
                                                        </div>

                                                        {activeFlete.status === 'accepted' && (
                                                            <div className="space-y-3">
                                                                <button
                                                                    onClick={() => openGoogleMaps(activeFlete.pickup_lat, activeFlete.pickup_lng)}
                                                                    className="w-full py-4 bg-primary-500 text-black text-lg font-black uppercase rounded-2xl shadow-xl hover:bg-primary-400 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                                >
                                                                    <Navigation className="w-5 h-5" />
                                                                    <span>Ir a Punto de Origen</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(activeFlete.id, 'arrived_pickup')}
                                                                    className="w-full py-4 bg-blue-600 text-lg font-black uppercase rounded-2xl shadow-xl hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                                >
                                                                    <MapPin className="w-5 h-5 text-white" />
                                                                    <span className="text-white">Llegué al Origen</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {activeFlete.status === 'arrived_pickup' && (
                                                            <button
                                                                onClick={() => handleStatusChange(activeFlete.id, 'in_transit')}
                                                                className="w-full py-4 bg-green-600 text-lg font-black uppercase rounded-2xl shadow-xl hover:bg-green-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                            >
                                                                <Navigation className="w-5 h-5 text-white" />
                                                                <span className="text-white">Iniciar Viaje</span>
                                                            </button>
                                                        )}

                                                        {activeFlete.status === 'in_transit' && (
                                                            <button
                                                                onClick={() => handleStatusChange(activeFlete.id, 'arrived_dropoff')}
                                                                className="w-full py-4 bg-secondary-600 text-lg font-black uppercase rounded-2xl shadow-xl hover:bg-secondary-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                            >
                                                                <Target className="w-5 h-5 text-white" />
                                                                <span className="text-white">Llegué al Destino</span>
                                                            </button>
                                                        )}

                                                        {activeFlete.status === 'arrived_dropoff' && (
                                                            <button
                                                                onClick={() => handleStatusChange(activeFlete.id, 'completed')}
                                                                className="w-full py-4 bg-green-600 text-lg font-black uppercase rounded-2xl shadow-xl hover:bg-green-500 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                            >
                                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                                                <span className="text-white">Finalizar Viaje</span>
                                                            </button>
                                                        )}

                                                        {/* Smaller Navigation Selection */}
                                                        <div className="flex gap-2 pt-2">
                                                            <button
                                                                onClick={() => setIsInternalNav(true)}
                                                                className="flex-1 py-3 bg-primary-500 text-black font-black italic text-[10px] uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/10"
                                                            >
                                                                <MapIcon className="w-3 h-3" />
                                                                <span>Navegación Interna</span>
                                                            </button>
                                                            <button
                                                                onClick={openFullRoute}
                                                                className="flex-1 py-3 bg-zinc-900/50 border border-white/5 text-zinc-500 font-black italic text-[10px] uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
                                                            >
                                                                <Navigation className="w-3 h-3" />
                                                                <span>Google Maps</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* Trip Summary Card */}
                                                    <div className="glass-card p-6 bg-black/90 backdrop-blur-3xl border-primary-500/20 shadow-2xl space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                                                <span className="text-[11px] font-black text-primary-500 uppercase italic tracking-widest">VIAJE EN CURSO</span>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-full text-[9px] font-bold text-zinc-500 uppercase italic">{activeFlete.status}</span>
                                                                <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[8px] font-black text-primary-500 uppercase italic tracking-tighter">{activeFlete.vehicle_categories?.name}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center bg-[var(--bg-color)]/50 p-4 rounded-2xl border border-[var(--border-color)]">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
                                                                    {activeFlete.profiles?.avatar_url ? (
                                                                        <img src={activeFlete.profiles.avatar_url} alt="Cliente" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User className="w-6 h-6 text-zinc-600" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[7px] font-black text-zinc-500 uppercase italic mb-0.5">Cliente</p>
                                                                    <h3 className="text-sm font-black italic text-[var(--text-color)] uppercase leading-none">{activeFlete.profiles?.full_name || "CLIENTE"}</h3>
                                                                </div>
                                                            </div>
                                                            <a href={`tel:${activeFlete.profiles?.phone}`} className="p-3 bg-primary-500 rounded-full text-black shadow-lg shadow-primary-500/20 active:scale-90 transition-transform">
                                                                <Phone className="w-5 h-5" />
                                                            </a>
                                                        </div>

                                                        {/* SHIPMENT DETAILS PANEL - HIGHLIGHTED */}
                                                        {activeFlete.shipment_details && (
                                                            <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
                                                                <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest mb-2 italic">📦 CARGAMENTO (DE DETALLE):</p>
                                                                <p className="text-[10px] font-bold text-zinc-300 uppercase italic leading-relaxed tracking-tight">{activeFlete.shipment_details}</p>
                                                            </div>
                                                        )}

                                                        <div className="space-y-3">
                                                            <div className="flex items-start gap-4 p-3 bg-zinc-950/50 rounded-xl">
                                                                <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                                                                <p className="text-[11px] font-black text-zinc-300 italic uppercase leading-tight">{activeFlete.pickup_address}</p>
                                                            </div>
                                                            <div className="flex items-start gap-4 p-3 bg-zinc-950/50 rounded-xl">
                                                                <Navigation className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                                                                <p className="text-[11px] font-black text-zinc-300 italic uppercase leading-tight">{activeFlete.dropoff_address}</p>
                                                            </div>
                                                        </div>

                                                        {/* LIVE STOPWATCH */}
                                                        <TripStopwatch flete={activeFlete} />

                                                        {/* PROMINENT PRICE AT DESTINATION */}
                                                        {activeFlete.status === 'arrived_dropoff' && (
                                                            <motion.div
                                                                initial={{ scale: 0.9, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                className="mt-6 p-8 bg-green-500 rounded-[2rem] text-black text-center shadow-[0_20px_50px_rgba(34,197,94,0.4)]"
                                                            >
                                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">COBRAR AL PASAJERO</p>
                                                                <h2 className="text-6xl font-black italic tracking-tighter">${activeFlete.estimated_price}</h2>
                                                                <div className="mt-4 flex items-center justify-center gap-2">
                                                                    <DollarSign className="w-5 h-5" />
                                                                    <span className="text-xs font-bold uppercase italic">Efectivo o Transferencia</span>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 bg-black/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
                                                    <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                                    <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-700">SIN VIAJE ACTIVO</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'garage' && (
                                        <motion.div key="garage" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="space-y-4 pointer-events-auto">
                                            {/* Active Vehicle Status */}
                                            <div className="glass-card p-6 border-primary-500/30 bg-primary-500/5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest italic mb-1">VEHÍCULO ACTIVO</p>
                                                        <h3 className="text-xl font-black text-white italic uppercase">{vehicles.find(v => v.id === profile.active_vehicle_id)?.brand || 'NO SELECCIONADO'}</h3>
                                                        <p className="text-[10px] font-bold text-zinc-500 italic uppercase">{vehicles.find(v => v.id === profile.active_vehicle_id)?.model}</p>
                                                    </div>
                                                    <div className="p-3 bg-primary-500 rounded-xl text-black">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-400 italic">Estás buscando pedidos para la categoría: <span className="text-primary-500 font-black uppercase">{vehicles.find(v => v.id === profile.active_vehicle_id)?.vehicle_categories?.name || '---'}</span></p>
                                            </div>

                                            {/* All Vehicles List */}
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 mt-6 px-2 italic">MIS VEHÍCULOS</h3>
                                            <div className="space-y-3">
                                                {vehicles.map(v => (
                                                    <div key={v.id} className={`glass-card p-5 border-white/5 bg-zinc-950/80 pointer-events-auto ${v.id === profile.active_vehicle_id ? 'ring-2 ring-primary-500/20 shadow-xl' : ''}`}>
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-lg font-black text-white italic uppercase">{v.brand} {v.model}</span>
                                                                    {v.verification_status === 'approved' ? (
                                                                        <ShieldCheck className="w-4 h-4 text-primary-500" />
                                                                    ) : v.verification_status === 'pending' ? (
                                                                        <Clock className="w-4 h-4 text-yellow-500" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    <span className="text-[8px] font-black uppercase bg-zinc-900 px-2 py-1 rounded text-zinc-500 italic">{v.license_plate}</span>
                                                                    <span className="text-[8px] font-black uppercase bg-primary-500/10 px-2 py-1 rounded text-primary-500 italic">{v.vehicle_categories?.name}</span>
                                                                </div>
                                                            </div>

                                                            {v.verification_status === 'approved' && v.id !== profile.active_vehicle_id && (
                                                                <button
                                                                    onClick={() => handleSwitchVehicle(v.id)}
                                                                    className="p-3 hover:bg-primary-500 hover:text-black rounded-xl border border-white/5 transition-all text-zinc-500"
                                                                >
                                                                    <Target className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => setShowAddVehicle(!showAddVehicle)}
                                                    className="w-full py-4 border-2 border-dashed border-zinc-900 rounded-2xl text-zinc-700 font-black italic text-[10px] uppercase hover:border-primary-500/30 hover:text-primary-500 transition-all"
                                                >
                                                    {showAddVehicle ? 'CANCELAR REGISTRO' : '+ AGREGAR OTRO VEHÍCULO'}
                                                </button>

                                                {showAddVehicle && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-white/10 bg-zinc-950">
                                                        <form onSubmit={handleAddVehicle} className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <input className="input-field text-xs" placeholder="MARCA" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                                                                <input className="input-field text-xs" placeholder="MODELO" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} required />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <input type="number" className="input-field text-xs" placeholder="AÑO" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                                                                <input className="input-field text-xs uppercase" placeholder="PATENTE" value={formData.license_plate} onChange={e => setFormData({ ...formData, license_plate: e.target.value })} required />
                                                            </div>
                                                            <select className="input-field text-xs bg-zinc-900 text-white" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                                                                <option value="">ELIJA CATEGORÍA</option>
                                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                            </select>
                                                            <textarea className="input-field text-xs resize-none" placeholder="JUSTIFICACIÓN (Capacidad, tipo de caja, etc)" value={formData.justification} onChange={e => setFormData({ ...formData, justification: e.target.value })} required />
                                                            <button type="submit" disabled={isSubmitting} className="premium-button w-full py-4 text-xs">
                                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'SOLICITAR APROBACIÓN'}
                                                            </button>
                                                        </form>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'history' && (
                                        <motion.div key="history" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="max-h-[50vh] overflow-y-auto space-y-3 pb-4 scrollbar-none pointer-events-auto">
                                            {completedHistory.map((f) => (
                                                <div key={f.id} className="p-5 bg-black/90 backdrop-blur-3xl border border-white/5 rounded-2xl space-y-4 pointer-events-auto">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <User className="w-3 h-3 text-primary-500" />
                                                                <p className="text-[11px] font-black text-white italic uppercase">{f.client?.full_name || 'Cliente'}</p>
                                                            </div>
                                                            <p className="text-[8px] font-black text-zinc-600 uppercase italic">{new Date(f.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">GANANCIA</p>
                                                            <p className="text-2xl font-black text-primary-500 italic">$ {f.estimated_price}</p>
                                                        </div>
                                                    </div>

                                                    {/* Route Details */}
                                                    <div className="space-y-2 border-t border-white/5 pt-3">
                                                        <div className="flex items-start gap-3">
                                                            <MapPin className="w-3 h-3 text-primary-500 shrink-0 mt-0.5" />
                                                            <p className="text-[9px] font-bold text-zinc-400 italic uppercase leading-tight">{f.pickup_address}</p>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <Navigation className="w-3 h-3 text-secondary-500 shrink-0 mt-0.5" />
                                                            <p className="text-[9px] font-bold text-zinc-400 italic uppercase leading-tight">{f.dropoff_address}</p>
                                                        </div>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                                                        <div className="bg-zinc-900/50 px-3 py-2 rounded-xl text-center">
                                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">DISTANCIA</p>
                                                            <p className="text-[10px] font-black text-white italic">{f.distance} km</p>
                                                        </div>
                                                        <div className="bg-zinc-900/50 px-3 py-2 rounded-xl text-center">
                                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">DURACIÓN</p>
                                                            <p className="text-[10px] font-black text-white italic">{f.duration} min</p>
                                                        </div>
                                                        <div className="bg-zinc-900/50 px-3 py-2 rounded-xl text-center">
                                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">VEHÍCULO</p>
                                                            <p className="text-[10px] font-black text-white italic truncate">{f.vehicle_categories?.name || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Shipment Details if available */}
                                                    {f.shipment_details && (
                                                        <div className="bg-primary-500/5 px-4 py-3 rounded-xl border border-primary-500/10">
                                                            <p className="text-[7px] font-black text-primary-500 uppercase mb-1">DETALLES DE CARGA</p>
                                                            <p className="text-[9px] font-bold text-zinc-300 italic uppercase leading-tight">{f.shipment_details}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {completedHistory.length === 0 && (
                                                <div className="text-center py-20 bg-black/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
                                                    <History className="w-10 h-10 mx-auto mb-4 text-zinc-800" />
                                                    <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-700">SIN HISTORIAL</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Navigation Mode Overlay - Higher Z-Index and Outside pointer-events container */}
            {isInternalNav && activeFlete && (
                <NavigationControls
                    activeFlete={activeFlete}
                    onExit={() => setIsInternalNav(false)}
                    onStatusChange={handleStatusChange}
                    handlePassengerConfirmation={() => setShowPassengerConfirm(true)}
                />
            )}

            {/* Modals outside everything */}
            <AnimatePresence>
                {/* ... existing modals like RatingModal ... */}
                {showPassengerConfirm && <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6">
                    <div className="bg-zinc-900 p-6 rounded-3xl w-full max-w-sm border border-white/10">
                        <h3 className="text-xl font-black text-white italic uppercase text-center mb-6">¿El cliente viaja con vos?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handlePassengerConfirmation(true)} className="py-4 bg-primary-500 rounded-2xl text-black font-black uppercase italic">SÍ, VIAJA</button>
                            <button onClick={() => handlePassengerConfirmation(false)} className="py-4 bg-zinc-800 rounded-2xl text-white font-black uppercase italic">NO, SOLO CARGA</button>
                        </div>
                    </div>
                </div>}

                {showRatingModal && completedTripId && (
                    <RatingModal
                        isOpen={showRatingModal}
                        onClose={() => {
                            setShowRatingModal(false)
                            setCompletedTripId(null)
                            setActiveTab('marketplace')
                        }}
                        onSubmit={handleRatingSubmit}
                        title="¿CÓMO FUE EL VIAJE?"
                        subtitle="Califica tu experiencia con el cliente"
                    />
                )}
            </AnimatePresence>

            {/* Chat Widget integrated into the flow if active voyage */}
            {activeFlete && ['accepted', 'arrived_pickup', 'in_transit', 'arrived_dropoff'].includes(activeFlete.status) && (
                <ChatWidget fleteId={activeFlete.id} receiverName={activeFlete.profiles?.full_name || "Cliente"} />
            )}

            {/* Passenger Confirmation Modal */}
            <AnimatePresence>
                {showPassengerConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPassengerConfirm(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-zinc-950 border border-white/10 rounded-3xl p-6 z-50 shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">
                                    ¿EL CLIENTE VIAJA?
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase italic">
                                    Confirma si el cliente viaja con la carga
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handlePassengerConfirmation(true)}
                                    className="py-4 bg-primary-500 text-black font-black italic text-[11px] uppercase rounded-xl hover:bg-primary-400 transition-colors"
                                >
                                    👤 SÍ, VIAJA
                                </button>
                                <button
                                    onClick={() => handlePassengerConfirmation(false)}
                                    className="py-4 bg-zinc-900 text-white font-black italic text-[11px] uppercase rounded-xl hover:bg-zinc-800 transition-colors"
                                >
                                    📦 SOLO CARGA
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => {
                    setShowRatingModal(false)
                    setCompletedTripId(null)
                    setActiveTab('marketplace')
                }}
                onSubmit={handleRatingSubmit}
                title="¿CÓMO FUE EL VIAJE?"
                subtitle="Califica tu experiencia con el cliente"
            />

            {/* CHAT TUTORIAL OVERLAY */}
            <AnimatePresence>
                {showChatTutorial && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                        {/* Background Shadow */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
                            onClick={() => {
                                setShowChatTutorial(false)
                                localStorage.setItem(`tutorial_chat_${activeFlete?.id}`, 'true')
                            }}
                        />

                        {/* Tutorial Card */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            className="relative z-[110] bg-zinc-950 border-2 border-primary-500 rounded-[2.5rem] p-8 max-w-sm mx-6 shadow-[0_0_80px_rgba(245,158,11,0.3)] text-center pointer-events-auto"
                        >
                            <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-500/20">
                                <MessageSquare className="w-10 h-10 text-primary-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">COMUNICACIÓN ELITE</h3>
                            <p className="text-[11px] font-bold text-zinc-400 uppercase italic leading-relaxed mb-8">
                                ¡Viaje aceptado! Antes de moverte, presentate con el cliente. Toca el botón de chat abajo a la derecha para coordinar detalles.
                            </p>
                            <button
                                onClick={() => {
                                    setShowChatTutorial(false)
                                    localStorage.setItem(`tutorial_chat_${activeFlete?.id}`, 'true')
                                    // Optionally trigger a click on the chat button or just dismiss
                                }}
                                className="premium-button w-full py-5"
                            >
                                ENTENDIDO, VAMOS
                            </button>

                            {/* Pointer Arrow */}
                            <div className="absolute -bottom-10 right-4 animate-bounce">
                                <ChevronRight className="w-12 h-12 text-primary-500 rotate-90" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default DriverDashboard
