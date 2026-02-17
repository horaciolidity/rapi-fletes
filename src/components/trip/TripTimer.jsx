import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

const TripTimer = ({ startTime, className = '' }) => {
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        if (!startTime) return

        const interval = setInterval(() => {
            const now = new Date()
            const start = new Date(startTime)
            const diff = Math.floor((now - start) / 1000) // seconds
            setElapsed(diff)
        }, 1000)

        return () => clearInterval(interval)
    }, [startTime])

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className={`flex items-center justify-center gap-3 bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 ${className}`}>
            <Clock className="w-5 h-5 text-primary-500 animate-pulse" />
            <div className="text-center">
                <p className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">TIEMPO TRANSCURRIDO</p>
                <p className="text-2xl font-black text-primary-500 italic tabular-nums">{formatTime(elapsed)}</p>
            </div>
        </div>
    )
}

export default TripTimer
