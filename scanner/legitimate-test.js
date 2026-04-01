// Legitimate WebSocket usage
import { io } from 'socket.io-client';

// Connect to Pusher for realtime chat
const socket = io('wss://ws.pusherapp.com/app/abc123456');

socket.on('connect', () => {
  // Send ping to keep connection alive
  socket.send('ping');

  // Send chat message (non-sensitive)
  socket.emit('message', {
    user: 'test',
    text: 'Hello world'
  });
});

// Local dev WebSocket
const localWs = new WebSocket('ws://localhost:8080/ws');
localWs.on('message', (data) => {
  console.log('Received:', data);
});
