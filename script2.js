const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const nextButton = document.getElementById('nextButton');
const hangUpButton = document.getElementById('hangUpButton');
const chatBody = document.getElementById('chat-body');
const messageInput = document.getElementById('message-input');

let localStream;
let remoteStream;
let peerConnection;
let spaceBarPressCount = 0;
let spaceBarTimer;           
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // STUN server for NAT traversal
    ]
};

// Start video chat
startButton.addEventListener('click', async () => {
    startButton.style.display = "none";
    hangUpButton.style.display = "inline";
    nextButton.style.display = "inline";
    
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    
    peerConnection = new RTCPeerConnection(configuration);
    peerConnection.addStream(localStream);
    
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send the candidate to the remote peer through your signaling server
        }
    };
    
    peerConnection.onaddstream = event => {
        remoteVideo.srcObject = event.stream;
    };
    
    // Create an offer and set local description
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // Send offer to the remote peer through your signaling server
});

// Hang up video chat
hangUpButton.addEventListener('click', () => {
    peerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    hangUpButton.style.display = "none";
    nextButton.style.display = "none";
    startButton.style.display = "inline";
});

// Send message function
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

// Listen for Enter key to send messages
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