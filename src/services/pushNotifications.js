import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../api/supabase';
import { useNotificationStore } from '../store/useNotificationStore';
import { Capacitor } from '@capacitor/core';

export const registerPushNotifications = async (userId) => {
    if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications are only available on native devices.');
        return;
    }

    try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.error('User denied push notification permissions');
            return;
        }

        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        PushNotifications.addListener('registration', async (token) => {
            console.log('Push registration success, token:', token.value);
            // Save the token to Supabase for this user
            if (userId) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ fcm_token: token.value })
                    .eq('id', userId);

                if (error) {
                    console.error('Error saving FCM token to profile:', error);
                } else {
                    console.log('FCM token saved successfully.');
                }
            }
        });

        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received:', notification);
            // Add native notification to in-app store so it pops up inside the app too
            useNotificationStore.getState().addNotification({
                title: notification.title || 'Nueva Notificación',
                message: notification.body || '',
                type: 'info'
            });
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push notification action performed:', notification.action);
            // Could navigate to a specific screen based on data payload
        });

    } catch (e) {
        console.error('Exception on push notification setup:', e);
    }
};
