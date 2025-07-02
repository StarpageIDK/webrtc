import { io } from 'socket.io-client';

const options = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"]
}

const socket = io('localhost:3000/', options); // не забыть поменять на серв

export default socket;