import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, ZoomControl } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Truck, Loader2, Crosshair, Radio, Activity } from 'lucide-react'
import { useBookingStore } from '../../store/useBookingStore'
import { useDriverLocationStore } from '../../store/useDriverLocationStore'
import { useThemeStore } from '../../store/useThemeStore'
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

const createCustomIcon = (color, emoji) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 2px solid white;
                box-shadow: 0 0 15px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="transform: rotate(45deg); font-size: 18px;">${emoji}</div>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -30]
    })
}

const truckIcon = L.divIcon({
    className: 'truck-marker',
    html: `
        <div style="
            background: #f59e0b;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 15px rgba(245,158,11,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
        ">
            <div style="font-size: 18px;">🚚</div>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
})

const MapController = ({ pickup, dropoff, autoDetectLocation }) => {
    const map = useMap()
    const [hasAutoDetected, setHasAutoDetected] = useState(false)

    useEffect(() => {
        if (autoDetectLocation && !hasAutoDetected && !pickup) {
            setHasAutoDetected(true)
            map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true })
        }
    }, [autoDetectLocation, hasAutoDetected, pickup, map])

    useEffect(() => {
        const onLocationError = () => {
            if (!pickup) map.setView([-34.6037, -58.3816], 13)
        }
        map.on('locationerror', onLocationError)
        return () => map.off('locationerror', onLocationError)
    }, [map, pickup])

    useEffect(() => {
        if (pickup && dropoff) {
            const bounds = L.latLngBounds([
                [pickup.lat, pickup.lng],
                [dropoff.lat, dropoff.lng]
            ])
            map.fitBounds(bounds, { padding: [50, 50] })
        } else if (pickup) {
            map.setView([pickup.lat, pickup.lng], 15)
        }
    }, [pickup, dropoff, map])

    return null
}

const RecenterControl = () => {
    const map = useMap()
    return (
        <div className="absolute top-4 right-4 z-[500] pointer-events-auto">
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    map.locate({ setView: true, maxZoom: 15 })
                }}
                className="p-4 bg-zinc-900 border border-white/10 rounded-2xl text-white hover:text-primary-500 transition-all shadow-2xl"
            >
                <Crosshair className="w-6 h-6" />
            </button>
        </div>
    )
}

const ClickHandler = ({ onClick }) => {
    const map = useMap()
    useEffect(() => {
        if (!onClick) return
        const handleClick = (e) => onClick(e.latlng)
        map.on('click', handleClick)
        return () => map.off('click', handleClick)
    }, [map, onClick])
    return null
}

const RoutingMachine = ({ pickup, dropoff, onRouteFound }) => {
    const map = useMap()
    useEffect(() => {
        if (!pickup || !dropoff || !map) return
        const fetchRoute = async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
                const res = await fetch(url)

                if (res.status === 429) {
                    console.warn('OSRM Rate Limit - Falling back to straight line')
                    return
                }

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

                const data = await res.json()
                if (data.routes && data.routes[0]) {
                    const route = data.routes[0]
                    onRouteFound({
                        coordinates: route.geometry.coordinates.map(c => [c[1], c[0]]),
                        distance: (route.distance / 1000).toFixed(1),
                        duration: Math.ceil(route.duration / 60)
                    })
                }
            } catch (err) {
                console.error('Route error:', err)
            }
        }
        fetchRoute()
    }, [pickup, dropoff, map, onRouteFound])
    return null
}

const FreightMap = ({ pickup: propPickup, dropoff: propDropoff, autoDetectLocation = false, showActiveDrivers = false, onMapClick = null }) => {
    const storeData = useBookingStore()
    const { activeDrivers, fetchActiveDrivers, getDriversNearLocation } = useDriverLocationStore()

    const { theme } = useThemeStore()
    const pickup = propPickup || storeData.pickup
    const dropoff = propDropoff || storeData.dropoff

    const [routeCoordinates, setRouteCoordinates] = useState([])
    const [routeInfo, setRouteInfo] = useState(null)
    const [nearbyDriversCount, setNearbyDriversCount] = useState(0)

    useEffect(() => { if (showActiveDrivers) fetchActiveDrivers() }, [showActiveDrivers, fetchActiveDrivers])
    useEffect(() => {
        if (pickup && showActiveDrivers) {
            const nearby = getDriversNearLocation(pickup.lat, pickup.lng, 5)
            setNearbyDriversCount(nearby.length)
        }
    }, [pickup, activeDrivers, showActiveDrivers, getDriversNearLocation])

    const handleRouteFound = (route) => {
        setRouteCoordinates(route.coordinates)
        setRouteInfo(route)
    }

    return (
        <div className="w-full h-full min-h-[500px] relative z-0">
            <MapContainer
                center={pickup ? [pickup.lat, pickup.lng] : [-34.6037, -58.3816]}
                zoom={13}
                style={{ height: '100%', width: '100%', background: '#111' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url={theme === 'dark'
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                    className="map-tiles-bright"
                />

                <MapController pickup={pickup} dropoff={dropoff} autoDetectLocation={autoDetectLocation} />
                <ClickHandler onClick={onMapClick} />
                <RecenterControl />
                <ZoomControl position="bottomright" />

                {pickup && dropoff && <RoutingMachine pickup={pickup} dropoff={dropoff} onRouteFound={handleRouteFound} />}
                {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.8, dashArray: '8, 12' }} />}

                {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={createCustomIcon('#0ea5e9', '📍')} />}
                {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={createCustomIcon('#ea580c', '🎯')} />}

                {showActiveDrivers && activeDrivers.map((driver) => (
                    driver.last_location_lat && driver.last_location_lng && (
                        <Marker key={driver.id} position={[driver.last_location_lat, driver.last_location_lng]} icon={truckIcon} />
                    )
                ))}
            </MapContainer>

            <div className="absolute bottom-6 left-6 pointer-events-none z-[500] flex flex-col gap-3">
                <AnimatePresence>
                    {routeInfo && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-black/90 border border-white/10 p-4 rounded-3xl flex gap-6 shadow-2xl overflow-hidden backdrop-blur-xl">
                            <div className="flex flex-col"><span className="text-[8px] font-black text-zinc-500 uppercase">Distancia</span><span className="text-xl font-black text-white">{routeInfo.distance} KM</span></div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col"><span className="text-[8px] font-black text-zinc-500 uppercase">Tiempo Est.</span><span className="text-xl font-black text-white">{routeInfo.duration} MIN</span></div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {showActiveDrivers && pickup && nearbyDriversCount > 0 && (
                    <div className="bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-full w-fit flex items-center gap-3 backdrop-blur-md">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase">{nearbyDriversCount} CONDUCTORES CERCA</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FreightMap
