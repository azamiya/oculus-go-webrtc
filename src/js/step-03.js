'use strict';

let localPeerConnection;
let remotePeerConnection;
let sendChannel;
const connectButton = document.getElementById('connectButton')
const sendButton = document.getElementById('sendButton')
const sendTextArea = document.getElementById('sendTextArea')
const receiveTextArea = document.getElementById('receiveTextArea')

const handleMessageReceived = (event) => {
  console.log("---handleMessageReceived---")
  console.log(event)
  const { data } = event
  receiveTextArea.value = data
}

const handleOnDataChannel = (event) => {
  console.log("---handleOnDataChannel---")
  console.log(event)
  const { channel } = event;
  channel.addEventListener('message', handleMessageReceived)

}

const createdAnswer = (description) => {
  remotePeerConnection.setLocalDescription(description)
    .then(() => {
      console.log("remotePeerConnection success")
    })

  localPeerConnection.setRemoteDescription(description)
    .then(() => {
      console.log("set remote description success")
    })
}

const createdOffer = (description) => {
  console.log("---description---")
  console.log(description)

  localPeerConnection.setLocalDescription(description)
  remotePeerConnection = new RTCPeerConnection();
  remotePeerConnection.addEventListener('icecandidate', handleOnRemoteIceCandidate)
  remotePeerConnection.addEventListener('datachannel', handleOnDataChannel)
  remotePeerConnection.setRemoteDescription(description)
  remotePeerConnection.createAnswer()
  .then(createdAnswer)
}

const handleOnLocalIceCandidate = (event) => {
  const { target, candidate } = event;

  if(candidate) {
    const newIceCandidate = new RTCIceCandidate(candidate)
    remotePeerConnection.addIceCandidate(candidate)
    .then(() => {
      console.log("---addLocalIceCandidate success---")
    })
  }
}

const handleOnRemoteIceCandidate = (event) => {
  const { target, candidate } = event;

  if(candidate) {
    const newIceCandidate = new RTCIceCandidate(candidate)
    localPeerConnection.addIceCandidate(candidate)
    .then(() => {
      console.log("---addRemoteIceCandidate success---")
    })
  }
}

const handleConnectButtonClicked = () => {
  console.log("handleConnectButtonClicked")
  sendTextArea.placeholder = ""
  localPeerConnection = new RTCPeerConnection();
  sendChannel = localPeerConnection.createDataChannel('sendDataChannel', null)
  localPeerConnection.addEventListener('icecandidate', handleOnLocalIceCandidate)

  localPeerConnection.createOffer()
    .then(createdOffer)
}

const handleSendButtonClicked = () => {
  sendChannel.send(sendTextArea.value)
}

connectButton.addEventListener('click', handleConnectButtonClicked)
sendButton.addEventListener('click', handleSendButtonClicked)
