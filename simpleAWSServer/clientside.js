// Load the required modules
const io = require('socket.io-client');
const socket = io('http://54.174.45.216:3000');

// Send a message to the server
socket.emit('user input', { word: 'Hello' });

// Listen for the server's reply
socket.on('reply', (data) => {
  console.log(data);
  socket.disconnect();
});
