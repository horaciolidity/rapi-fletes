import { supabase } from '../api/supabase';

/**
 * Sube un archivo a Supabase Storage
 * @param {File} file El archivo a subir
 * @param {string} bucket El nombre del bucket ('profiles' o 'vehicles')
 * @param {string} path La ruta dentro del bucket (ej: 'uid/avatar.jpg')
 * @returns {Promise<string>} La URL pública del archivo
 */
export const uploadFile = async (file, bucket, path) => {
    if (!file) return null;

    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw error;

        // Obtener la URL pública
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error(`Error al subir archivo a Supabase (${bucket}):`, error);
        throw error;
    }
};

export default { uploadFile };
