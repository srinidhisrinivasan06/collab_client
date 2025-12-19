import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    
    if (!email) {
      navigate('/login');
      return;
    }
    
    setUserRole(role);
  }, [navigate]);

  if (userRole === null) {
    return <div>Loading...</div>;
  }

  const startVideoCall = () => {
    const newRoomId = 'room-' + Date.now();
    navigate(`/video/${newRoomId}`);
  };

  const joinVideoCall = () => {
    if (roomId.trim()) {
      navigate(`/video/${roomId}`);
    } else {
      alert('Please enter a room ID');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>User Role: {userRole}</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={startVideoCall}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          Start New Video Call
        </button>
        
        <div style={{ marginTop: '15px' }}>
          <input
            type="text"
            placeholder="Enter Room ID to join"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
              padding: '8px',
              marginRight: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '200px'
            }}
          />
          <button 
            onClick={joinVideoCall}
            style={{
              padding: '8px 16px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Join Call
          </button>
        </div>
      </div>

      {userRole === 'admin' ? (
        <div>
          <h2>Admin Dashboard</h2>
          <p>Admin features will go here</p>
        </div>
      ) : (
        <div>
          <h2>Student Dashboard</h2>
          <p>Student features will go here</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;