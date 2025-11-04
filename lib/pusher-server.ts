/**
 * Server-side Pusher configuration
 * This file is only imported on the server and should never be included in client bundles
 */
import Pusher from "pusher"

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  useTLS: true,
})

// Alias export for compatibility
export const pusherServer = pusher
