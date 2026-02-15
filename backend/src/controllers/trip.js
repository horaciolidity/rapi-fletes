import prisma from '../services/db.js';

export const createTrip = async (req, res) => {
    try {
        const { originAddr, originLat, originLng, destAddr, destLat, destLng, distance, duration, price, scheduledAt } = req.body;

        const trip = await prisma.trip.create({
            data: {
                clientId: req.user.id,
                originAddr,
                originLat,
                originLng,
                destAddr,
                destLat,
                destLng,
                distance,
                duration,
                price,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            },
        });

        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ message: 'Error creating trip', error: error.message });
    }
};

export const getTrips = async (req, res) => {
    try {
        const where = req.user.role === 'DRIVER' ? { driverId: req.user.id } : { clientId: req.user.id };
        if (req.user.role === 'ADMIN') delete where.clientId;

        const trips = await prisma.trip.findMany({
            where,
            include: {
                client: { select: { name: true, phone: true } },
                driver: { select: { name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trips', error: error.message });
    }
};

export const updateTripStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, driverId } = req.body;

        const trip = await prisma.trip.update({
            where: { id },
            data: { status, driverId: driverId || undefined },
        });

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: 'Error updating trip', error: error.message });
    }
};
