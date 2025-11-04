/**
 * Updated import to use pusher-client instead of pusher
 */
"use client"

import { useEffect, useRef } from "react"
import { pusherClient } from "@/lib/pusher-client"

interface PusherEvent {
  channel: string
  event: string
  callback: (data: any) => void
}

export function usePusher(events: PusherEvent[]) {
  const subscribedChannels = useRef<Set<string>>(new Set())

  useEffect(() => {
    events.forEach(({ channel, event, callback }) => {
      if (!subscribedChannels.current.has(channel)) {
        const channelInstance = pusherClient.subscribe(channel)
        subscribedChannels.current.add(channel)

        channelInstance.bind(event, callback)

        return () => {
          channelInstance.unbind(event, callback)
          if (subscribedChannels.current.has(channel)) {
            pusherClient.unsubscribe(channel)
            subscribedChannels.current.delete(channel)
          }
        }
      }
    })
  }, [events])

  return null
}
