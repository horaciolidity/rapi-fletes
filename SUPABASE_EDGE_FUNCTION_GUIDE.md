// Supabase Edge Function to send FCM notifications
// Deploy this with: supabase functions deploy send-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { tokens, title, body, data } = await req.json()

  // IMPORTANT: You need your Firebase Service Account JSON
  // Store the private key in Supabase Secrets: 
  // supabase secrets set FIREBASE_SERVICE_ACCOUNT='{...}'

  const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')
  
  // This is a simplified example. In production, use the Firebase Admin SDK or Google Auth library for Deno
  // to get an access token for the FCM V1 API.
  
  // For a quick PoC, some people use the Legacy Server Key (not recommended but easier)
  // If using Legacy Server Key:
  /*
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${Deno.env.get('FIREBASE_LEGACY_SERVER_KEY')}`
    },
    body: JSON.stringify({
      registration_ids: tokens,
      notification: { title, body, sound: 'default' },
      data: data,
      priority: 'high'
    })
  })
  */

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
