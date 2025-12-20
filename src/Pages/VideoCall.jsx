import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const VideoCall = () => {
  const { roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  useEffect(() => {
    const newSocket = io('https://YOUR_DEPLOYED_BACKEND_URL');
    setSocket(newSocket);

    const userId = localStorage.getItem('userId');
    newSocket.emit('join-room', roomId, userId);

    startVideo();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      newSocket.disconnect();
    };
  }, [roomId]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access');
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('user-connected', async (userId) => {
      console.log('User connected:', userId);
      await createPeerConnection();
      await createOffer();
    });

    socket.on('offer', async (data) => {
      await createPeerConnection();
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', { roomId, answer });
    });

    socket.on('answer', async (data) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on('ice-candidate', async (data) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('chat-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('notes-update', (data) => {
      setNotes(data.notes);
    });
  }, [socket, roomId]);

  const createPeerConnection = async () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate });
      }
    };
  };

  const createOffer = async () => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit('offer', { roomId, offer });
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const messageData = {
        roomId,
        message: newMessage,
        sender: localStorage.getItem('email') || 'Anonymous',
        timestamp: new Date().toLocaleTimeString()
      };
      socket.emit('chat-message', messageData);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const updateNotes = (newNotes) => {
    setNotes(newNotes);
    if (socket) {
      socket.emit('notes-update', { roomId, notes: newNotes });
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  return (
    <div style={{ padding: '20px', background: '#000' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#fff' }}>Video Call - Room: {roomId}</h2>
        <button 
          onClick={copyRoomId}
          style={{
            padding: '8px 16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Copy Room ID
        </button>
        <p style={{ color: '#ccc', fontSize: '14px', marginTop: '10px' }}>
          Share this Room ID with others to join the call
        </p>
      </div>
      <div style={{ display: 'flex', gap: '20px', height: '80vh' }}>
        {/* Left Side - Teaching Whiteboard */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#333', margin: 0 }}>Teaching Whiteboard</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => document.getElementById('whiteboard').focus()}
                style={{
                  padding: '8px 16px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
Type
              </button>
              <button
                onClick={() => setNotes('')}
                style={{
                  padding: '8px 16px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
Clear
              </button>
              <button
                onClick={() => {
                  const text = `\n\n--- ${new Date().toLocaleTimeString()} ---\n`;
                  updateNotes(notes + text);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
Timestamp
              </button>
            </div>
          </div>
          <textarea
            id="whiteboard"
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
placeholder=""
            style={{
              width: '100%',
              height: 'calc(100% - 60px)',
              border: '2px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              fontSize: '16px',
              fontFamily: 'monospace',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.5'
            }}
          />
        </div>
        
        {/* Right Side - Videos and Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Videos Section - Side by Side */}
          <div style={{ background: '#222', borderRadius: '8px', padding: '15px', height: '250px' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>Participants</h3>
            <div style={{ display: 'flex', gap: '10px', height: 'calc(100% - 40px)' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '12px' }}>You</h4>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  style={{ width: '100%', height: '100%', background: '#333', borderRadius: '5px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '12px' }}>Student</h4>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  style={{ width: '100%', height: '100%', background: '#333', borderRadius: '5px' }}
                />
              </div>
            </div>
          </div>
          
          {/* Chat Section */}
          <div style={{ background: '#222', borderRadius: '8px', padding: '15px', flex: 1 }}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>Questions & Chat</h3>
            
            <div style={{
              height: '200px',
              overflowY: 'auto',
              background: '#333',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px'
            }}>
              {messages.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <div style={{ color: '#4CAF50', fontSize: '12px' }}>
                    {msg.sender} - {msg.timestamp}
                  </div>
                  <div style={{ color: '#fff', fontSize: '14px' }}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'stretch',
              background: '#111',
              padding: '10px',
              borderRadius: '8px',
              border: '2px solid #555'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  console.log('Typing:', e.target.value);
                  setNewMessage(e.target.value);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                autoComplete="off"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #666',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#000',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => {
                  console.log('Send clicked, message:', newMessage);
                  sendMessage();
                }}
                style={{
                  padding: '12px 20px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '80px'
                }}
              >
                SEND
              </button>
            </div>
            <p style={{ color: '#ccc', fontSize: '12px', marginTop: '5px' }}>
              Current message: "{newMessage}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
