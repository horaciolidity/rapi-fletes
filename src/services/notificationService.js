import { supabase } from '../api/supabase';

/**
 * Service to handle notification logic
 */
export const notificationService = {
    /**
     * Sends a push notification to a specific user (driver/admin)
     * Note: This usually requires a backend/Edge Function for security.
     * Here we call a Supabase Edge Function named 'send-fcm-notification'
     */
    sendPushNotification: async (userId, title, body, data = {}) => {
        try {
            // 1. Get the user's FCM token from the database
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('fcm_token')
                .eq('id', userId)
                .single();

            if (profileError || !profile?.fcm_token) {
                console.warn('No FCM token found for user:', userId);
                return;
            }

            // 2. Call Supabase Edge Function
            const { data: res, error } = await supabase.functions.invoke('send-notification', {
                body: {
                    to: profile.fcm_token,
                    title,
                    body,
                    data
                }
            });

            if (error) throw error;
            return res;
        } catch (err) {
            console.error('Error sending push notification:', err);
        }
    },

    /**
     * Notify all drivers about a new trip
     */
    notifyNewTrip: async (tripData) => {
        try {
            // Get all active drivers (you might want to filter by category or proximity)
            const { data: drivers, error } = await supabase
                .from('profiles')
                .select('id, fcm_token')
                .eq('role', 'driver')
                .not('fcm_token', 'is', null);

            if (error) throw error;

            // In a real app, you'd send this to many tokens at once via the backend.
            // Here we can trigger the Edge Function for each or once for all.
            if (drivers && drivers.length > 0) {
                const tokens = drivers.map(d => d.fcm_token);

                await supabase.functions.invoke('send-broadcast-notification', {
                    body: {
                        tokens,
                        title: '¡NUEVO VIAJE DISPONIBLE! 🚚',
                        body: `Flete de ${tripData.pickup_address.split(',')[0]} por $${tripData.estimated_price}`,
                        data: {
                            fleteId: tripData.id,
                            type: 'new_trip'
                        }
                    }
                });
            }
        } catch (err) {
            console.error('Error notifying drivers:', err);
        }
    }
};
