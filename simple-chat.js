const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');

const certificateOptions = {
  key: fs.readFileSync(path.resolve('./cert/server.key')),
  cert: fs.readFileSync(path.resolve('./cert/server.crt'))
}

const app = express();
app.use(express.static('src'))

const server = https.createServer(certificateOptions, app)

var io = require('socket.io')(server);

server.listen(3333, () => {
  console.log('listening on *:3333');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (message) => {
    console.log('message: ' + message)
    io.emit('chat message', message);
  })
});