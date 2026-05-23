import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '../store/authStore'

export function useWebSocket(subscriptions = []) {
  const clientRef = useRef(null)
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        subscriptions.forEach(({ topic, callback }) => {
          client.subscribe(topic, (message) => {
            try { callback(JSON.parse(message.body)) } catch (e) { callback(message.body) }
          })
        }
        )
      },
      onStompError: (frame) => console.error('STOMP error', frame),
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [token])

  const send = useCallback((destination, body) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) })
    }
  }, [])

  return { send }
}
