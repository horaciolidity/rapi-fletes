import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, Loader2, Crosshair, Radio, Activity } from 'lucide-react'
import { useBookingStore } from '../../store/useBookingStore'
import { useDriverLocationStore } from '../../store/useDriverLocationStore'
import { supabase } from '../../api/supabase'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons
const createCustomIcon = (color, emoji) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${color};
                width: 40px;
                height: 40px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="transform: rotate(45deg); font-size: 20px;">${emoji}</div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    })
}

const truckIcon = L.divIcon({
    className: 'truck-marker',
    html: `
        <div style="
            background: #f59e0b;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 20px rgba(245,158,11,0.6), 0 0 40px rgba(245,158,11,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
        ">
            <div style="font-size: 20px;">🚚</div>
        </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
})

const liveDriverIcon = L.divIcon({
    className: 'live-driver-marker',
    html: `
        <div style="position: relative;">
            <div style="
                position: absolute;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: rgba(245,158,11,0.2);
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            "></div>
            <div style="
                background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 25px rgba(245,158,11,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            ">
                <div style="font-size: 22px;">🚚</div>
            </div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
})

// Routing component using OSRM API
const RoutingMachine = ({ pickup, dropoff, onRouteFound }) => {
    const map = useMap()

    useEffect(() => {
        if (!pickup || !dropoff || !map) return

        const fetchRoute = async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
                const response = await fetch(url)
                const data = await response.json()

                if (data.routes && data.routes[0]) {
                    const route = data.routes[0]
                    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])

                    if (onRouteFound) {
                        onRouteFound({
                            coordinates,
                            distance: (route.distance / 1000).toFixed(1),
                            duration: Math.ceil(route.duration / 60),
                        })
                    }
                }
            } catch (error) {
                console.error('Error fetching route:', error)
            }
        }

        fetchRoute()
    }, [pickup, dropoff, map, onRouteFound])

    return null
}

// Fix for map resizing in flex containers
const ResizeMap = () => {
    const map = useMap()
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize()
        }, 500)
        return () => clearTimeout(timer)
    }, [map])
    return null
}

// Map controller for auto-centering and bounds fitting
const MapController = ({ pickup, dropoff, autoDetectLocation, driverLocation }) => {
    const map = useMap()
    const [hasAutoDetected, setHasAutoDetected] = useState(false)

    useEffect(() => {
        if (autoDetectLocation && !hasAutoDetected && !pickup) {
            setHasAutoDetected(true)
            map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true })
        }
    }, [autoDetectLocation, hasAutoDetected, pickup, map])

    // Handle geolocation errors or denials gracefully
    useEffect(() => {
        const onLocationError = (e) => {
            console.warn("Map Geolocation error:", e.message)
            // If user denies or it fails, center on a default visible point (BA)
            if (!pickup) {
                map.setView([-34.6037, -58.3816], 13)
            }
        }
        map.on('locationerror', onLocationError)
        return () => map.off('locationerror', onLocationError)
    }, [map, pickup])

    useEffect(() => {
        if (driverLocation && pickup && dropoff) {
            const bounds = L.latLngBounds([
                [pickup.lat, pickup.lng],
                [dropoff.lat, dropoff.lng],
                [driverLocation.lat, driverLocation.lng]
            ])
            map.fitBounds(bounds, { padding: [80, 80] })
        } else if (pickup && dropoff) {
            const bounds = L.latLngBounds(
                [pickup.lat, pickup.lng],
                [dropoff.lat, dropoff.lng]
            )
            map.fitBounds(bounds, { padding: [50, 50] })
        } else if (pickup) {
            map.setView([pickup.lat, pickup.lng], 16)
        }
    }, [pickup, dropoff, driverLocation, map])

    return null
}

// Live tracking subscriber
const LiveTrackingUpdater = ({ fleteId, onLocationUpdate }) => {
    useEffect(() => {
        if (!fleteId) return
        let channel = null

        const startTracking = async () => {
            const { data: flete } = await supabase
                .from('fletes')
                .select('driver_id')
                .eq('id', fleteId)
                .single()

            if (flete?.driver_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('last_location_lat, last_location_lng')
                    .eq('id', flete.driver_id)
                    .single()

                if (profile?.last_location_lat) {
                    onLocationUpdate({
                        lat: profile.last_location_lat,
                        lng: profile.last_location_lng,
                        timestamp: new Date().toISOString()
                    })
                }

                channel = supabase
                    .channel(`live_tracking_${flete.driver_id}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${flete.driver_id}`
                    }, (payload) => {
                        const { last_location_lat, last_location_lng } = payload.new
                        if (last_location_lat && last_location_lng) {
                            onLocationUpdate({
                                lat: last_location_lat,
                                lng: last_location_lng,
                                timestamp: new Date().toISOString()
                            })
                        }
                    })
                    .subscribe()
            }
        }

        startTracking()
        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [fleteId, onLocationUpdate])

    return null
}

// Map click handler
const ClickHandler = ({ onClick }) => {
    const map = useMap()
    useEffect(() => {
        if (!onClick) return
        const handleClick = (e) => {
            onClick(e.latlng)
        }
        map.on('click', handleClick)
        return () => map.off('click', handleClick)
    }, [map, onClick])
    return null
}

const FreightMap = ({
    pickup: propPickup,
    dropoff: propDropoff,
    distance: propDistance,
    duration: propDuration,
    autoDetectLocation = false,
    showActiveDrivers = false,
    enableLiveTracking = false,
    fleteId = null,
    driverLocation: propDriverLocation = null,
    onMapClick = null
}) => {
    const storeData = useBookingStore()
    const { activeDrivers, fetchActiveDrivers, getDriversNearLocation } = useDriverLocationStore()

    const pickup = propPickup || storeData.pickup
    const dropoff = propDropoff || storeData.dropoff

    const [isSimulating, setIsSimulating] = useState(false)
    const [nearbyDriversCount, setNearbyDriversCount] = useState(0)
    const [routeCoordinates, setRouteCoordinates] = useState([])
    const [routeInfo, setRouteInfo] = useState(null)
    const [driverLocation, setDriverLocation] = useState(propDriverLocation)
    const [trafficLevel, setTrafficLevel] = useState('normal')

    useEffect(() => {
        if (showActiveDrivers) fetchActiveDrivers()
    }, [showActiveDrivers, fetchActiveDrivers])

    useEffect(() => {
        if (pickup && showActiveDrivers) {
            const nearby = getDriversNearLocation(pickup.lat, pickup.lng, 5)
            setNearbyDriversCount(nearby.length)
        }
    }, [pickup, activeDrivers, showActiveDrivers, getDriversNearLocation])

    useEffect(() => {
        if (pickup?.address && dropoff?.address && !routeInfo) {
            setIsSimulating(true)
        }
    }, [pickup?.address, dropoff?.address, routeInfo])

    useEffect(() => {
        const hour = new Date().getHours()
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) setTrafficLevel('high')
        else if (hour >= 12 && hour <= 14) setTrafficLevel('normal')
        else setTrafficLevel('low')
    }, [])

    const handleRouteFound = (route) => {
        setRouteCoordinates(route.coordinates)
        setRouteInfo(route)
        setIsSimulating(false)
    }

    const getTrafficColor = () => {
        switch (trafficLevel) {
            case 'low': return '#10b981'
            case 'normal': return '#f59e0b'
            case 'high': return '#ef4444'
            default: return '#f59e0b'
        }
    }

    const getTrafficLabel = () => {
        switch (trafficLevel) {
            case 'low': return 'Tráfico Fluido'
            case 'normal': return 'Tráfico Moderado'
            case 'high': return 'Tráfico Intenso'
            default: return 'Tráfico Normal'
        }
    }

    return (
        <div className="relative w-full h-full min-h-[500px] bg-zinc-900 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <MapContainer
                center={pickup ? [pickup.lat, pickup.lng] : [-34.6037, -58.3816]}
                zoom={13}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                className="rounded-3xl"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ResizeMap />
                <MapController pickup={pickup} dropoff={dropoff} autoDetectLocation={autoDetectLocation} driverLocation={driverLocation} />
                <ClickHandler onClick={onMapClick} />

                {pickup && dropoff && <RoutingMachine pickup={pickup} dropoff={dropoff} onRouteFound={handleRouteFound} />}

                {routeCoordinates.length > 0 && (
                    <Polyline positions={routeCoordinates} pathOptions={{ color: '#0ea5e9', weight: 5, opacity: 0.8, dashArray: '10, 10', lineCap: 'round', lineJoin: 'round' }} />
                )}

                {pickup && (
                    <>
                        <Marker position={[pickup.lat, pickup.lng]} icon={createCustomIcon('#0ea5e9', '📍')}>
                            <Popup>
                                <div className="text-center p-2">
                                    <p className="font-black text-xs uppercase text-primary-500 mb-1">📍 Punto de Recogida</p>
                                    <p className="text-[10px] text-zinc-700">{pickup.address}</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Circle center={[pickup.lat, pickup.lng]} radius={500} pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }} />
                    </>
                )}

                {dropoff && (
                    <Marker position={[dropoff.lat, dropoff.lng]} icon={createCustomIcon('#ea580c', '🎯')}>
                        <Popup>
                            <div className="text-center p-2">
                                <p className="font-black text-xs uppercase text-secondary-600 mb-1">🎯 Punto de Entrega</p>
                                <p className="text-[10px] text-zinc-700">{dropoff.address}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {enableLiveTracking && driverLocation && (
                    <>
                        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={liveDriverIcon}>
                            <Popup>
                                <div className="text-center p-2">
                                    <p className="font-black text-xs uppercase text-primary-500 mb-1">🚚 Conductor en Camino</p>
                                    <p className="text-[9px] text-green-600 font-bold mt-1">● EN VIVO</p>
                                </div>
                            </Popup>
                        </Marker>
                        <LiveTrackingUpdater fleteId={fleteId} onLocationUpdate={setDriverLocation} />
                    </>
                )}

                {showActiveDrivers && activeDrivers.map((driver) => (
                    driver.last_location_lat && driver.last_location_lng && (
                        <Marker key={driver.id} position={[driver.last_location_lat, driver.last_location_lng]} icon={truckIcon}>
                            <Popup>
                                <div className="text-center p-2">
                                    <p className="font-black text-xs uppercase text-primary-500 mb-1">🚚 Conductor Activo</p>
                                    <p className="text-[10px] text-zinc-700">{driver.full_name}</p>
                                    <p className="text-[9px] text-green-600 font-bold mt-1">✓ Disponible</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 pointer-events-none z-[1000]">
                <div className="flex flex-col sm:flex-row gap-3 items-start justify-between">
                    <AnimatePresence>
                        {routeInfo && (
                            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="glass-card p-4 flex items-center gap-6 pointer-events-auto bg-black/80 backdrop-blur-xl border-white/10">
                                <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black italic">Distancia</span><span className="text-xl font-black text-white italic">{routeInfo.distance} km</span></div>
                                <div className="w-[1px] h-10 bg-zinc-700" />
                                <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest text-zinc-500 font-black italic">Tiempo Est.</span><span className="text-xl font-black text-white italic">{routeInfo.duration} min</span></div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showActiveDrivers && pickup && (
                            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="glass-card p-4 flex items-center gap-4 pointer-events-auto bg-primary-500/10 backdrop-blur-xl border-primary-500/30">
                                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center"><Truck className="w-5 h-5 text-black" /></div>
                                <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest text-primary-400 font-black italic">Conductores</span><span className="text-2xl font-black text-white italic">{nearbyDriversCount}</span></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {routeInfo && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="glass-card p-3 flex items-center gap-3 pointer-events-auto bg-black/80 backdrop-blur-xl border-white/10 w-fit">
                            <Activity className="w-4 h-4" style={{ color: getTrafficColor() }} /><span className="text-[10px] uppercase tracking-wider font-black italic" style={{ color: getTrafficColor() }}>{getTrafficLabel()}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {enableLiveTracking && driverLocation && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-6 left-6 z-[1000] pointer-events-none">
                        <div className="glass-card px-4 py-3 flex items-center gap-3 bg-primary-500/20 backdrop-blur-xl border-primary-500/40">
                            <div className="relative"><Radio className="w-5 h-5 text-primary-500" /><div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" /></div>
                            <span className="text-[10px] uppercase tracking-wider text-white font-black italic">Rastreo en Vivo</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSimulating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1001] pointer-events-auto">
                        <div className="glass-card px-8 py-6 flex items-center gap-4 border-primary-500/50 bg-black/90"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /><span className="font-black text-white uppercase tracking-wider italic">Calculando mejor ruta...</span></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Recenter Control */}
            <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => {
                        const map = document.querySelector('.leaflet-container')?._leaflet_map
                        if (map) map.locate({ setView: true, maxZoom: 16 })
                    }}
                    className="p-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:text-primary-500 transition-all shadow-xl pointer-events-auto group"
                    title="Mi ubicación"
                >
                    <Crosshair className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    )
}

export default FreightMap
