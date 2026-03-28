import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export const locationService = {
    getCurrentPosition: async (options = { enableHighAccuracy: true }) => {
        if (Capacitor.isNativePlatform()) {
            let hasPermission = await Geolocation.checkPermissions();
            if (hasPermission.location !== 'granted') {
                hasPermission = await Geolocation.requestPermissions();
            }
            if (hasPermission.location !== 'granted') {
                throw new Error('Permisos de ubicación denegados');
            }
            return await Geolocation.getCurrentPosition(options);
        } else {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocalización no soportada por el navegador.'));
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });
        }
    },

    watchPosition: async (options = { enableHighAccuracy: true }, callback, errorCallback) => {
        if (Capacitor.isNativePlatform()) {
             let hasPermission = await Geolocation.checkPermissions();
             if (hasPermission.location !== 'granted') {
                 hasPermission = await Geolocation.requestPermissions();
             }
             if (hasPermission.location !== 'granted') {
                 if(errorCallback) errorCallback(new Error('Permisos de ubicación denegados'));
                 return null;
             }
             const id = await Geolocation.watchPosition(options, (pos, err) => {
                 if (err) {
                    if(errorCallback) errorCallback(err);
                 } else {
                    callback(pos);
                 }
             });
             return id;
        } else {
             if (!navigator.geolocation) return null;
             const id = navigator.geolocation.watchPosition(
                 (pos) => callback(pos),
                 (err) => {
                     if (errorCallback) errorCallback(err);
                 },
                 options
             );
             return id;
        }
    },

    clearWatch: async (watchId) => {
        if (!watchId) return;
        if (Capacitor.isNativePlatform()) {
             await Geolocation.clearWatch({ id: watchId });
        } else {
             navigator.geolocation.clearWatch(watchId);
        }
    }
}
