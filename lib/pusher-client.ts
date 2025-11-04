/**
 * Client-side Pusher configuration
 * This file is safe for client-side usage as it only uses public keys
 */
"use client"

import PusherClient from "pusher-js"

export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
})
