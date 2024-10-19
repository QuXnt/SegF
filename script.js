'use strict';

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const nextButton = document.getElementById('nextButton');
const hangUpButton = document.getElementById('hangUpButton');
const chatBody = document.getElementById('chat-body');
const messageInput = document.getElementById('message-input');

let pc;
let localStream;
let remoteStream;
let peerConnection;
let spaceBarPressCount = 0;
let spaceBarTimer;  

const signaling = new BroadcastChannel('webrtc');
signaling.onmessage = e => {
  if (!localStream) {
    console.log('not ready yet');
    return;
  }
  switch (e.data.type) {
    case 'offer':
      handleOffer(e.data);
      break;
    case 'answer':
      handleAnswer(e.data);
      break;
    case 'candidate':
      handleCandidate(e.data);
      break;
    case 'ready':
      // A second tab joined. This tab will initiate a call unless in a call already.
      if (pc) {
        console.log('already in call, ignoring');
        return;
      }
      makeCall();
      break;
    case 'bye':
      if (pc) {
        hangup();
      }
      break;
    default:
      console.log('unhandled', e);
      break;
  }
};

startButton.addEventListener('click', async () => {
  localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
  localVideo.srcObject = localStream;

  startButton.style.display = "none";
  hangUpButton.style.display = "inline";
  nextButton.style.display = "inline";

  signaling.postMessage({type: 'ready'});
});

hangUpButton.addEventListener('click', () => {
    if (pc) {
        pc.close();
        pc = null;
    }
    localStream.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    localStream = null;
    remoteVideo.srcObject = null;
    hangUpButton.style.display = "none";
    nextButton.style.display = "none";
    startButton.style.display = "inline";
  signaling.postMessage({type: 'bye'});
});

async function hangup() {
  if (pc) {
    pc.close();
    pc = null;
  }
  localStream.getTracks().forEach(track => track.stop());
  localVideo.srcObject = null;
  localStream = null;
  remoteVideo.srcObject = null;
  hangUpButton.style.display = "none";
  nextButton.style.display = "none";
  startButton.style.display = "inline";
};

function createPeerConnection() {
  pc = new RTCPeerConnection();
  pc.onicecandidate = e => {
    const message = {
      type: 'candidate',
      candidate: null,
    };
    if (e.candidate) {
      message.candidate = e.candidate.candidate;
      message.sdpMid = e.candidate.sdpMid;
      message.sdpMLineIndex = e.candidate.sdpMLineIndex;
    }
    signaling.postMessage(message);
  };
  pc.ontrack = e => remoteVideo.srcObject = e.streams[0];
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
}

async function makeCall() {
  await createPeerConnection();

  const offer = await pc.createOffer();
  signaling.postMessage({type: 'offer', sdp: offer.sdp});
  await pc.setLocalDescription(offer);
}

async function handleOffer(offer) {
  if (pc) {
    console.error('existing peerconnection');
    return;
  }
  await createPeerConnection();
  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  signaling.postMessage({type: 'answer', sdp: answer.sdp});
  await pc.setLocalDescription(answer);
}

async function handleAnswer(answer) {
  if (!pc) {
    console.error('no peerconnection');
    return;
  }
  await pc.setRemoteDescription(answer);
}

async function handleCandidate(candidate) {
  if (!pc) {
    console.error('no peerconnection');
    return;
  }
  if (!candidate.candidate) {
    await pc.addIceCandidate(null);
  } else {
    await pc.addIceCandidate(candidate);
  }
}

messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        // Prevent default space bar behavior (scrolling the page)
        event.preventDefault();
        
        spaceBarPressCount++;

        // If space bar is pressed twice
        if (spaceBarPressCount === 2) {
            handleNextButton();
            spaceBarPressCount = 0; // Reset count
        }

        // Reset timer after a short duration (300 milliseconds)
        clearTimeout(spaceBarTimer);
        spaceBarTimer = setTimeout(() => {
            spaceBarPressCount = 0; // Reset count if time exceeds 300ms
        }, 300);
    }
});

function sendMessage() {
  const messageText = messageInput.value.trim();
  
  if (messageText) {
      // Append user message to chat
      const userMessage = document.createElement('div');
      userMessage.className = 'chat-message user';
      userMessage.textContent = messageText;
      chatBody.appendChild(userMessage);
      
      // Clear the input field
      messageInput.value = '';
      
      // Simulate bot response after a delay
      setTimeout(() => {
          const botMessage = document.createElement('div');
          botMessage.className = 'chat-message bot';
          botMessage.textContent = 'This is a bot response.';
          chatBody.appendChild(botMessage);
          
          // Scroll to the bottom of the chat
          chatBody.scrollTop = chatBody.scrollHeight;
      }, 1000);
      
      // Scroll to the bottom of the chat
      chatBody.scrollTop = chatBody.scrollHeight;
  }
}