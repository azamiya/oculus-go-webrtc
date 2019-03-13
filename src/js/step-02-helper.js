'use strict'

let localPeerConnection = null;
let remotePeerConnection = null;

const handleConnectionChange = event => {
  console.log("---event---")
  console.log(event)
}


const getOtherPeer = peerConnection => {
  return (peerConnection === localPeerConnection) ? remotePeerConnection : localPeerConnection
} 

const handleConnection = event => {
  const peerConnection = event.target;
  const iceCandidate = event.candidate;

  if(iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection)

    otherPeer.addIceCandidate(newIceCandidate).then(() => {
      console.log("---connection success---")
    })
  }
}

const handleOnTrackConnection = event => {
  console.log("---handleOnTrackConnection---")
  console.log(event)
  const mediaStream = event.stream;
  document.getElementById("remoteVideo").srcObject = new MediaStream([event.track])
}

const createdAnswer = (res) => {
  remotePeerConnection.setLocalDescription(res).then(
    (r) => console.log("setLocalDescription success")
  ).catch(e => console.log(e))
  localPeerConnection.setRemoteDescription(res).then(p => {
    console.log("setRemoteDescription success")
  }).catch(err => {
    console.log(err)
  })
}

const createdOffer = description => {
  console.log("---description---")
  console.log(description)
  localPeerConnection.setLocalDescription(description)
  remotePeerConnection = new RTCPeerConnection(null)
  remotePeerConnection.addEventListener("track", handleOnTrackConnection)

  remotePeerConnection.setRemoteDescription(description)
  remotePeerConnection.createAnswer().then(createdAnswer)
}


const hanldeStartButton = () => {
  console.log("hanldeStartButton")
  localPeerConnection = new RTCPeerConnection(null);
  localPeerConnection
    .addEventListener('icecandidate', handleConnection);
  localPeerConnection
    .addEventListener('iceconnectionstatechange', handleConnectionChange)
  
  console.log("---localStream---")
  console.log(localStream)
  localPeerConnection.addTrack(localStream.getVideoTracks()[0])
  
  localPeerConnection.createOffer({
    offerToReceiveVideo: 1,
  }).then(createdOffer)
}

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", hanldeStartButton)