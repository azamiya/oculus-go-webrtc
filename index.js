const path = require('path');
const fs = require('fs');
const express = require('express');
const https = require('https');

const certificateOptions = {
  key: fs.readFileSync(path.resolve('./cert/server.key')),
  cert: fs.readFileSync(path.resolve('./cert/server.crt'))
}

const app = express();
app.use(express.static('src'))

const server = https.createServer(certificateOptions, app)

const io = require('socket.io')(server)

server.listen(3333, () => {
  console.log("listening on *:3333")
})

const handleCreateOrJoin = (socket, roomName) => {
  console.log("roomName: ", roomName)
  console.log(io.adapter.rooms)
  socket.join(roomName, () => {
    console.log("user created room name: ", roomName)
    socket.emit('created', roomName)
    handleRooms(socket)
  })
}

const handleRooms = (socket) => {
  const rooms = Object.keys(socket.adapter.rooms)

  socket.emit('rooms', rooms)
}

const handleJoinRoom = (socket, roomName) => {
  console.log("---handleJoinRoom---")
  console.log(roomName)
  socket.join(roomName, () => {
    socket.emit('joined', roomName)
  })
}

const handleDescription = (socket, data) => {
  const { description, roomName } = data;
  console.log("---description---")
  console.log(description)

  console.log("---roomName---")
  console.log(roomName)
  socket.to(roomName).emit("description", description)
}

const handleAnswerDescription = (socket, data) => {
  console.log("---handleAnswerDescription---")
  const { description, roomName } = data;
  socket.to(roomName).emit('answerDescription', description)
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  const rooms = Object.keys(socket.rooms)
  console.log(rooms)

  console.log(Object.keys(socket.adapter.rooms))
  // console.log(socket.adapter.rooms)

  socket.on('create or join', (roomName) => {
    handleCreateOrJoin(socket, roomName)
  })

  socket.on('getRooms', () => {
    handleRooms(socket)
  })

  socket.on('joinRoom', (roomName) => {
    handleJoinRoom(socket, roomName)
  })

  socket.on('description', (data) => {
    handleDescription(socket, data)
  })

  socket.on('answerDescription', (data) => {
    handleAnswerDescription(socket, data)
  })
})
