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
        popupAnchor: [0, -36]
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

// Map controller for auto-centering and bounds fitting
const MapController = ({ pickup, dropoff, autoDetectLocation, driverLocation }) => {
    const map = useMap()
    const [hasAutoDetected, setHasAutoDetected] = useState(false)

    useEffect(() => {
        if (autoDetectLocation && !hasAutoDetected && !pickup) {
            setHasAutoDetected(true)
            map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true })
        }
    }, [autoDetectLocation, hasAutoDetected, pickup, map])

    useEffect(() => {
        const onLocationError = (e) => {
            if (e.code !== 1) console.warn("Map Geolocation error:", e.message)
            if (!pickup) {
                map.setView([-34.6037, -58.3816], 13) // Default Buenos Aires
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
            map.fitBounds(bounds, { padding: [50, 50] })
        } else if (pickup && dropoff) {
            const positions = [
                [pickup.lat, pickup.lng],
                [dropoff.lat, dropoff.lng]
            ]
            map.fitBounds(positions, { padding: [50, 50] })
        } else if (pickup) {
            map.setView([pickup.lat, pickup.lng], 15)
        }
    }, [pickup, dropoff, driverLocation, map])

    return null
}

const RecenterControl = () => {
    const map = useMap()
    return (
        <div className="absolute top-4 right-4 z-[1000]">
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    map.locate({ setView: true, maxZoom: 15 })
                }}
                className="p-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:text-primary-500 transition-all shadow-2xl pointer-events-auto"
                title="Mi ubicación"
            >
                <Crosshair className="w-6 h-6" />
            </button>
        </div>
    )
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

const FreightMap = ({
    pickup: propPickup,
    dropoff: propDropoff,
    autoDetectLocation = false,
    showActiveDrivers = false,
    onMapClick = null
}) => {
    const storeData = useBookingStore()
    const { activeDrivers, fetchActiveDrivers, getDriversNearLocation } = useDriverLocationStore()

    const pickup = propPickup || storeData.pickup
    const dropoff = propDropoff || storeData.dropoff

    const [routeCoordinates, setRouteCoordinates] = useState([])
    const [routeInfo, setRouteInfo] = useState(null)
    const [nearbyDriversCount, setNearbyDriversCount] = useState(0)

    useEffect(() => {
        if (showActiveDrivers) fetchActiveDrivers()
    }, [showActiveDrivers, fetchActiveDrivers])

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
        <div className="w-full h-full min-h-[500px] bg-zinc-900 overflow-hidden relative">
            <MapContainer
                center={pickup ? [pickup.lat, pickup.lng] : [-34.6037, -58.3816]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapController
                    pickup={pickup}
                    dropoff={dropoff}
                    autoDetectLocation={autoDetectLocation}
                />

                <ClickHandler onClick={onMapClick} />
                <RecenterControl />

                {pickup && dropoff && (
                    <RoutingMachine pickup={pickup} dropoff={dropoff} onRouteFound={handleRouteFound} />
                )}

                {routeCoordinates.length > 0 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.8, dashArray: '8, 12' }}
                    />
                )}

                {pickup && (
                    <Marker position={[pickup.lat, pickup.lng]} icon={createCustomIcon('#0ea5e9', '📍')}>
                        <Popup>
                            <div className="text-[10px] font-bold uppercase p-1">Origen: {pickup.address}</div>
                        </Popup>
                    </Marker>
                )}

                {dropoff && (
                    <Marker position={[dropoff.lat, dropoff.lng]} icon={createCustomIcon('#ea580c', '🎯')}>
                        <Popup>
                            <div className="text-[10px] font-bold uppercase p-1">Destino: {dropoff.address}</div>
                        </Popup>
                    </Marker>
                )}

                {showActiveDrivers && activeDrivers.map((driver) => (
                    driver.last_location_lat && driver.last_location_lng && (
                        <Marker
                            key={driver.id}
                            position={[driver.last_location_lat, driver.last_location_lng]}
                            icon={truckIcon}
                        />
                    )
                ))}
            </MapContainer>

            {/* Overlays */}
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-[1000] flex flex-col gap-3">
                <AnimatePresence>
                    {routeInfo && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl w-fit flex gap-6"
                        >
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black italic text-zinc-500 uppercase">Distancia</span>
                                <span className="text-xl font-black italic text-white">{routeInfo.distance} KM</span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black italic text-zinc-500 uppercase">Tiempo Est.</span>
                                <span className="text-xl font-black italic text-white">{routeInfo.duration} MIN</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {showActiveDrivers && pickup && nearbyDriversCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-primary-500/10 backdrop-blur-md border border-primary-500/20 px-4 py-2 rounded-full w-fit flex items-center gap-3"
                    >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black italic text-white uppercase">{nearbyDriversCount} CONDUCTORES CERCA</span>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default FreightMap
