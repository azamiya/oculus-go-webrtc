'use strict';

const socket = io();
let isInitiator = false;

const createRoomButton = document.getElementById('createRoomButton');
const getRoomsButton = document.getElementById('getRoomsButton');
const roomList = document.getElementById('roomList');
const connectButton = document.getElementById('connectButton');
const startButton = document.getElementById('startButton');

const sampleDataButton = document.getElementById('sampleDataButton')
const getVideoButton = document.getElementById('getVideoButton')

let localPeerConnection = null;
let myRoom = null;
let sendChannel = null;

const mediaStreamConstrains = {
  video: true,
  audio: false
}

let localStream = null;

const onCreateRoomButtonClicked = () => {
  const roomName = prompt("Room Name", "");
  console.log(roomName)
  if(roomName.length) {
    socket.emit('create or join', roomName)
    myRoom = roomName
  } else {
    alert("NO EMPTY ROOM roomName")
  }
}

const onGetRoomsButtonClicked = () => {
  socket.emit('getRooms')
}

const joinButtonClicked = (event) => {
  const roomName = event.target.value;
  myRoom = roomName;
  socket.emit('joinRoom', roomName)
}

const handleOnLocalIceCandidate = (event) => {
  const { target, candidate } = event;

  if(candidate) {
    const newIceCandidate = new RTCIceCandidate(candidate);
    localPeerConnection.addIceCandidate(newIceCandidate)
      .then(() => {
        console.log("---handleOnLocalIceCandidate success---")
      })
      .catch(err => {
        console.warn(err)
      })
  }

}

const handleMessageReceived = event => {
  console.log("---handleMessageReceived---")
  const { data } = event;
  console.log(data)
}

const handleOnDataChannel = event => {
  const { channel } = event;
  channel.addEventListener('message', handleMessageReceived)
}

const onConnectButtonClicked = () => {
  localPeerConnection = new RTCPeerConnection();
  sendChannel = localPeerConnection.createDataChannel('sendDataChannel', null)
  if(localStream) {
    localPeerConnection.addTrack(localStream.getVideoTracks()[0])
  }
  localPeerConnection.addEventListener('datachannel', handleOnDataChannel)
}

const createdOffer = (description) => {
  localPeerConnection.addEventListener('icecandidate', handleOnLocalIceCandidate)
  localPeerConnection.setLocalDescription(description)
    .then(() => {
      console.log("---setLocalDescription Success")

      socket.emit('description', {
        description,
        roomName: myRoom
      })
    })
}

const onStartButtonClicked = () => {
  localPeerConnection.createOffer()
    .then(createdOffer)
}

const handleOnTrackConnection = event => {
  console.log("---handleOnTrackConnection---")
  console.log(event)
  const mediaStream = event.stream;
  document.getElementById("remoteVideo").srcObject = new MediaStream([event.track])
}

const createdAnswer = (description) => {
  console.log("---createdAnswer---")
  
  localPeerConnection.addEventListener('icecandidate', handleOnLocalIceCandidate)
  localPeerConnection.setLocalDescription(description)
    .then(() => {
      console.log("---setLocalDescription success")
      localPeerConnection.addEventListener('datachannel', handleOnDataChannel)
    })
  socket.emit('answerDescription', {
    roomName: myRoom,
    description
  })
}

const onSampleDataButtonClicked = () => {
  sendChannel.send("SAMPLE SAMPLE SAMPLE")
}

const gotLocalMediaStream = mediaStream => {
  localStream = mediaStream;
}

const handleLocalMediaStreamError = error => {
  alert("error: " + error)
}

const onVideoButtonClicked = () => {
  navigator.mediaDevices.getUserMedia(mediaStreamConstrains)
  .then(gotLocalMediaStream).catch(handleLocalMediaStreamError)
}

createRoomButton.addEventListener('click', onCreateRoomButtonClicked);
getRoomsButton.addEventListener('click', onGetRoomsButtonClicked);
connectButton.addEventListener('click', onConnectButtonClicked)
startButton.addEventListener('click', onStartButtonClicked)
sampleDataButton.addEventListener('click', onSampleDataButtonClicked)
getVideoButton.addEventListener('click', onVideoButtonClicked)

socket.on('created', (roomName) => {
  isInitiator = true;
  console.log(`room name ${roomName} is created.`)
})

socket.on('rooms', (rooms) => {
  console.log("---rooms---")
  console.log(rooms)
  rooms.map(room => {
    const listNode = document.createElement("LI");
    const textnode = document.createTextNode(room);
    listNode.appendChild(textnode)

    const buttonNode = document.createElement("BUTTON");
    buttonNode.appendChild(document.createTextNode("JOIN"))
    buttonNode.value = room;
    buttonNode.addEventListener('click', joinButtonClicked)
    listNode.appendChild(buttonNode)

    roomList.appendChild(listNode)
  })
})

socket.on('joined', (roomName) => {
  console.log('joined ', roomName)
})

socket.on('description', (description) => {
  console.log("---description from server---")
  console.log(description)
  if(!isInitiator) {
    localPeerConnection.addEventListener("track", handleOnTrackConnection)
    localPeerConnection.setRemoteDescription(description)
      .then(() => {
        console.log("---setRemoteDescription success---")


        localPeerConnection.createAnswer()
          .then(createdAnswer)
      })
  }
})

socket.on('answerDescription', (description) => {
  if(isInitiator) {
    localPeerConnection.setRemoteDescription(description)
      .then(() => {
        console.log("---setRemoteDescription success---")
      })
  }
})
