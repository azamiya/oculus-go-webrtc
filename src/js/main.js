'use strict'

const mediaStreamConstrains = {
  video: true
};

const localVideo = document.querySelector('video');

let localStream;

const gotLocalMediaStream = mediaStream => {
  localStream = mediaStream;
  localVideo.srcObject = mediaStream
}

const handleLocalMediaStreamError = error => {
  console.log("error: " + error)
}

const handleLocalVideoButton = () => {
  navigator.mediaDevices.getUserMedia(mediaStreamConstrains)
  .then(gotLocalMediaStream).catch(handleLocalMediaStreamError)
}

const localVideoButton = document.getElementById("localVideoButton")
localVideoButton.addEventListener("click", handleLocalVideoButton)

const handleLocalVideoStopButton = () => {
  localStream.getVideoTracks()[0].stop()
}

const localVideoStopButton = document.getElementById("localVideoStopButton")
localVideoStopButton.addEventListener("click", handleLocalVideoStopButton)