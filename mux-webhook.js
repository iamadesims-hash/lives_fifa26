export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const event = req.body;

  console.log(`📡 Mux Webhook Received: ${event.type}`);

  try {
    // Broadcast live status to all connected clients via Supabase Realtime
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role for backend
    );

    await supabase.channel('live-status').send({
      type: 'broadcast',
      event: 'stream_status',
      payload: {
        type: event.type,
        playback_id: event.data?.playback_id || null,
        timestamp: new Date().toISOString()
      }
    });

    // Optional: Log to database
    if (event.type === 'video.live_stream.active') {
      console.log("🔴 STREAM IS LIVE!");
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}