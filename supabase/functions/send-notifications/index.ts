// supabase/functions/send-notifications/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Get notifications ready to send
  const now = new Date()
  const { data: notifications, error } = await supabase
    .from('notification_queue')
    .select('*')
    .lte('scheduled_for_utc', now.toISOString())
    .eq('sent', false)
    .limit(50)
  
  if (!notifications || notifications.length === 0) {
    return new Response(JSON.stringify({ message: 'No notifications to send' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  const results = []
  
  for (const notification of notifications) {
    try {
      // Send to Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: notification.push_token,
          title: notification.title,
          body: notification.body,
          data: {
            type: notification.notification_type,
            scheduled_time: notification.scheduled_for_local,
          },
        }),
      })
      
      const result = await response.json()
      
      // Mark as sent
      await supabase
        .from('notification_queue')
        .update({ 
          sent: true, 
          sent_at: now.toISOString() 
        })
        .eq('id', notification.id)
      
      results.push({ id: notification.id, status: 'sent', result })
      
    } catch (error) {
      results.push({ id: notification.id, status: 'failed', error: error.message })
    }
  }
  
  return new Response(JSON.stringify({ 
    processed: results.length,
    results 
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})