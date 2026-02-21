import React, { useState, useEffect } from 'react'
import { Clock, Play, Flag, CheckCircle2 } from 'lucide-react'

const TripStopwatch = ({ flete }) => {
    const [segments, setSegments] = useState({
        loading: { elapsed: "00:00", active: false },
        transit: { elapsed: "00:00", active: false },
        unloading: { elapsed: "00:00", active: false }
    })

    const calculateTime = (startTime, endTime = null) => {
        if (!startTime) return "00:00"
        const start = new Date(startTime).getTime()
        const end = endTime ? new Date(endTime).getTime() : Date.now()
        const diff = Math.max(0, end - start)

        const seconds = Math.floor((diff / 1000) % 60)
        const minutes = Math.floor((diff / 1000 / 60) % 60)
        const hours = Math.floor(diff / 1000 / 60 / 60)

        const pad = (num) => String(num).padStart(2, '0')

        return hours > 0
            ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
            : `${pad(minutes)}:${pad(seconds)}`
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const newSegments = { ...segments }

            // Segment 1: Arrived Pickup -> In Transit (Loading)
            if (flete.arrived_pickup_time) {
                newSegments.loading = {
                    elapsed: calculateTime(flete.arrived_pickup_time, flete.trip_start_time),
                    active: flete.status === 'arrived_pickup'
                }
            }

            // Segment 2: In Transit -> Arrived Dropoff (Traveling)
            if (flete.trip_start_time) {
                newSegments.transit = {
                    elapsed: calculateTime(flete.trip_start_time, flete.arrived_dropoff_time),
                    active: flete.status === 'in_transit'
                }
            }

            // Segment 3: Arrived Dropoff -> Completed (Unloading/Payment)
            if (flete.arrived_dropoff_time) {
                newSegments.unloading = {
                    elapsed: calculateTime(flete.arrived_dropoff_time, flete.trip_end_time),
                    active: flete.status === 'arrived_dropoff'
                }
            }

            setSegments(newSegments)
        }, 1000)

        return () => clearInterval(interval)
    }, [flete])

    const Segment = ({ title, time, active, icon: Icon, color }) => (
        <div className={`flex items-center justify-between p-3 rounded-xl border ${active ? `bg-${color}-500/10 border-${color}-500/30 animate-pulse` : 'bg-black/20 border-white/5 opacity-50'}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${active ? `bg-${color}-500 text-black` : 'bg-zinc-800 text-zinc-500'}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className={`text-[8px] font-black uppercase italic ${active ? `text-${color}-500` : 'text-zinc-600'}`}>{title}</p>
                    <p className={`text-sm font-black italic tabular-nums ${active ? 'text-white' : 'text-zinc-500'}`}>{time}</p>
                </div>
            </div>
            {active && <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`} />}
        </div>
    )

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3 h-3 text-primary-500" />
                <span className="text-[9px] font-black text-primary-500 uppercase italic tracking-widest">CRONÓMETRO DE VIAJE</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <Segment
                    title="CARGA EN ORIGEN"
                    time={segments.loading.elapsed}
                    active={segments.loading.active}
                    icon={Play}
                    color="blue"
                />
                <Segment
                    title="EN TRAYECTO"
                    time={segments.transit.elapsed}
                    active={segments.transit.active}
                    icon={Flag}
                    color="primary"
                />
                <Segment
                    title="DESCARGA Y PAGO"
                    time={segments.unloading.elapsed}
                    active={segments.unloading.active}
                    icon={CheckCircle2}
                    color="green"
                />
            </div>
        </div>
    )
}

export default TripStopwatch
