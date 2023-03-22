const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('a user connected');
  
  // listen for incoming JSON objects from "user" client
  socket.on('user input', (data) => {
    console.log('received input from user:', data);
    
    
    // forward input to "player" client
    io.sockets.emit('reply', {message: "wagwan"});
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});



