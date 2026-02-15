export const initSockets = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-trip', (tripId) => {
            socket.join(tripId);
            console.log(`User joined trip room: ${tripId}`);
        });

        socket.on('update-location', (data) => {
            // data: { tripId, lat, lng, driverId }
            io.to(data.tripId).emit('location-updated', data);
        });

        socket.on('send-message', (data) => {
            // data: { tripId, senderId, content }
            io.to(data.tripId).emit('new-message', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
