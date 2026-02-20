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

// Custom Car Marker that attempts to show direction (static for now, dynamic if we had heading)
const CarMarker = ({ position }) => (
    <Marker position={position} icon={L.divIcon({
        className: 'car-marker',
        html: `
            <div style="
                width: 40px; 
                height: 40px; 
                background: #3b82f6; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 0 20px rgba(59,130,246,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    width: 0; 
                    height: 0; 
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-bottom: 16px solid white;
                    transform: translateY(-2px);
                "></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    })} />
)

const MapController = ({ pickup, dropoff, autoDetectLocation, isNavigating, userLocation }) => {
    const map = useMap()
    const [hasAutoDetected, setHasAutoDetected] = useState(false)

    useEffect(() => {
        if (autoDetectLocation && !hasAutoDetected && !pickup) {
            setHasAutoDetected(true)
            map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true })
        }
    }, [autoDetectLocation, hasAutoDetected, pickup, map])

    useEffect(() => {
        if (isNavigating && userLocation) {
            // Aggressive auto-centering for navigation
            // We use flyTo for smooth transition, but high zoom (18) for street level
            map.flyTo([userLocation.lat, userLocation.lng], 18, {
                animate: true,
                duration: 0.5, // Faster updates
                easeLinearity: 0.5
            })
        }
    }, [isNavigating, userLocation, map])

    useEffect(() => {
        const onLocationError = () => {
            if (!pickup) map.setView([-34.6037, -58.3816], 13)
        }
        map.on('locationerror', onLocationError)
        return () => map.off('locationerror', onLocationError)
    }, [map, pickup])

    useEffect(() => {
        if (!isNavigating && pickup && dropoff) {
            const bounds = L.latLngBounds([
                [pickup.lat, pickup.lng],
                [dropoff.lat, dropoff.lng]
            ])
            map.fitBounds(bounds, { padding: [50, 50] })
        } else if (!isNavigating && pickup) {
            map.setView([pickup.lat, pickup.lng], 15)
        }
    }, [pickup, dropoff, map, isNavigating])

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

        const handleFallback = () => {
            onRouteFound({
                coordinates: [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]],
                distance: (L.latLng(pickup.lat, pickup.lng).distanceTo(L.latLng(dropoff.lat, dropoff.lng)) / 1000).toFixed(1),
                duration: Math.ceil(L.latLng(pickup.lat, pickup.lng).distanceTo(L.latLng(dropoff.lat, dropoff.lng)) / 1000 * 2),
                steps: []
            })
        }

        const fetchRoute = async () => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 4000)

            try {
                // Add &steps=true and &language=es to get instructions
                const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson&steps=true&notifications=none`
                const res = await fetch(url, { signal: controller.signal }).catch(() => null)
                clearTimeout(timeoutId)

                if (!res) {
                    handleFallback()
                    return
                }

                if (res.status === 429) {
                    console.warn('OSRM Rate Limit')
                    handleFallback()
                    return
                }

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

                const data = await res.json()
                if (data.routes && data.routes[0]) {
                    const route = data.routes[0]
                    onRouteFound({
                        coordinates: route.geometry.coordinates.map(c => [c[1], c[0]]),
                        distance: (route.distance / 1000).toFixed(1),
                        duration: Math.ceil(route.duration / 60),
                        steps: route.legs[0].steps.map(step => ({
                            instruction: step.maneuver.instruction,
                            type: step.maneuver.type,
                            modifier: step.maneuver.modifier,
                            name: step.name,
                            distance: step.distance,
                            location: [step.maneuver.location[1], step.maneuver.location[0]]
                        }))
                    })
                }
            } catch (err) {
                console.error('Routing err:', err)
                handleFallback()
            }
        }
        fetchRoute()
    }, [pickup, dropoff, map, onRouteFound])
    return null
}

const NavigationOverlay = ({ steps, currentPos }) => {
    const [currentStep, setCurrentStep] = useState(null)
    const [distanceToStep, setDistanceToStep] = useState(0)

    useEffect(() => {
        if (!steps || steps.length === 0 || !currentPos) {
            if (steps && steps.length > 0) {
                setCurrentStep(steps[0])
                setDistanceToStep(steps[0].distance)
            }
            return
        }

        // Find the nearest upcoming maueuver
        // This is a simplified logic: find the step with the minimum distance to current pos
        // In a full app, we would track progress index
        let minDist = Infinity
        let nextStep = steps[0]

        for (const step of steps) {
            const stepLoc = L.latLng(step.location[0], step.location[1])
            const dist = stepLoc.distanceTo(currentPos)

            // Heuristic: If we are very close to a step (e.g., < 20m), we might be "at" it, 
            // but for visual instruction we usually want to see the *target* we are approaching.
            // We'll simplisticly pick the closest step point for now.
            if (dist < minDist) {
                minDist = dist
                nextStep = step
            }
        }

        // If we are extremely close to the step (<10m), we might assume we are executing it 
        // and should look at the next one? For safety/simplicity, let's just show the closest.

        setCurrentStep(nextStep)
        setDistanceToStep(Math.round(minDist))

    }, [steps, currentPos])

    if (!currentStep) return null

    return (
        <motion.div
            initial={{ y: -150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 right-0 z-[3000] pointer-events-none p-4 safe-area-top"
        >
            <div className="bg-[#18181b] border-b-4 border-green-500 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative max-w-lg mx-auto">
                {/* Top Green Bar */}
                <div className="bg-green-600 h-2 w-full" />

                <div className="p-5 flex items-center gap-5">
                    <div className="w-16 h-16 bg-neutral-800 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                        <Navigation className="w-8 h-8 text-white transform -rotate-45" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-black text-white italic uppercase truncate leading-none mb-2">
                            {currentStep.instruction || "Siga la ruta"}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-green-500 italic leading-none">{distanceToStep} M</span>
                            {currentStep.name && <span className="text-neutral-500 text-sm font-bold uppercase truncate border-l border-neutral-700 pl-3 max-w-[150px]">{currentStep.name}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

const FreightMap = ({
    pickup: propPickup,
    dropoff: propDropoff,
    autoDetectLocation = false,
    showActiveDrivers = false,
    onMapClick = null,
    isNavigating = false
}) => {
    const storeData = useBookingStore()
    const { activeDrivers, fetchActiveDrivers, getDriversNearLocation } = useDriverLocationStore()

    const { theme } = useThemeStore()
    const pickup = propPickup || storeData.pickup
    const dropoff = propDropoff || storeData.dropoff

    const [routeCoordinates, setRouteCoordinates] = useState([])
    const [routeInfo, setRouteInfo] = useState(null)
    const [nearbyDriversCount, setNearbyDriversCount] = useState(0)
    const [userLocation, setUserLocation] = useState(null)

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
                onLocationfound={(e) => setUserLocation(e.latlng)}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url={theme === 'dark'
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                    className="map-tiles-bright"
                />

                <MapController pickup={pickup} dropoff={dropoff} autoDetectLocation={autoDetectLocation || isNavigating} isNavigating={isNavigating} userLocation={userLocation} />
                <ClickHandler onClick={onMapClick} />
                <RecenterControl />
                <ZoomControl position="bottomright" />

                {/* Dynamic Routing based on Navigation State */}
                {!isNavigating && pickup && dropoff && <RoutingMachine pickup={pickup} dropoff={dropoff} onRouteFound={handleRouteFound} />}

                {isNavigating && userLocation && pickup && dropoff && (
                    /* When navigating, route from USER to the TARGET (which is either pickup or dropoff depending on phase) */
                    <RoutingMachine
                        pickup={{ lat: userLocation.lat, lng: userLocation.lng }}
                        dropoff={dropoff} // In parent, 'dropoff' prop is already switched to be the target
                        onRouteFound={handleRouteFound}
                        key={`${userLocation.lat.toFixed(4)}-${userLocation.lng.toFixed(4)}`} // Force refresh on significant move
                    />
                )}
                {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} pathOptions={{ color: isNavigating ? '#3b82f6' : '#f59e0b', weight: isNavigating ? 8 : 6, opacity: 0.9, lineJoin: 'round' }} />}

                {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={createCustomIcon('#0ea5e9', '📍')} />}
                {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={createCustomIcon('#ea580c', '🎯')} />}

                {/* Driver Self Marker when navigating */}
                {isNavigating && userLocation && <CarMarker position={userLocation} />}

                {showActiveDrivers && activeDrivers.map((driver) => (
                    driver.last_location_lat && driver.last_location_lng && (
                        <Marker key={driver.id} position={[driver.last_location_lat, driver.last_location_lng]} icon={truckIcon} />
                    )
                ))}
            </MapContainer>

            {/* Navigation Instructions */}
            {isNavigating && routeInfo?.steps && (
                <NavigationOverlay steps={routeInfo.steps} currentPos={userLocation} />
            )}

            <div className="absolute bottom-6 left-6 pointer-events-none z-[500] flex flex-col gap-3">
                <AnimatePresence>
                    {routeInfo && !isNavigating && (
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
