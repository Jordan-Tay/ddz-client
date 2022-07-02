import { Snackbar } from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "../components/Button";
import { SocketContext } from "../context/socket";
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const Start = ({ name, setName, setUserId, setRoomId }) => {
  const [showRoomIdInput, setShowRoomIdInput] = useState(false);
  const [tryRoomId, setTryRoomId] = useState('');
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [roomFull, setRoomFull] = useState(false);
  const socket = useContext(SocketContext);

  const handleCreateRoom = () => {
    socket.emit('create-room', name);
  }

  const handleJoinRoom = () => {
    socket.emit('join-room', { name, roomId: tryRoomId });
  }

  const handleJoiningRoom = useCallback(({ userId, roomId }) => {
    console.log(userId);
    console.log(roomId);
    setUserId(userId);
    setRoomId(roomId);
  }, [setRoomId, setUserId])

  useEffect(() => {
    socket.on('joining-room', handleJoiningRoom);
    socket.on('no-room-found', () => setRoomNotFound(true));
    socket.on('full-room', () => setRoomFull(true));
    return () => {
      socket.off('joining-room');
      socket.off('no-room-found');
      socket.off('full-room');
    }
  }, [handleJoiningRoom, socket]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Snackbar autoHideDuration={2000} open={roomNotFound} onClose={() => setRoomFull(false)} color='danger'>
        <Alert severity="error">The room ID entered is not found</Alert>
      </Snackbar>
      <Snackbar autoHideDuration={2000} open={roomFull} onClose={() => setRoomNotFound(false)}>
        <Alert severity="warning">The room is full</Alert>
      </Snackbar>
      <div style={{ width: '400px', height: '300px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <input style={{
            border: '1px solid grey',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
            fontSize: '20px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '10px'
          }} 
          placeholder='Name'
          onChange={(e) => {
            setName(e.target.value);
          }} />
        {!showRoomIdInput && <Button label='Create Room' onClick={handleCreateRoom} />}
        {showRoomIdInput && <input style={{
            border: '1px solid grey',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
            fontSize: '20px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '10px'
          }} 
          placeholder='Enter your room ID'
          onChange={(e) => {
            setTryRoomId(e.target.value);
          }} />}
        <Button label='Join Room' onClick={() => {
          if (!showRoomIdInput) {
            setShowRoomIdInput(true);
          } else {
            handleJoinRoom();
          }
        }} />
      </div>
    </div>
  );
}

export default Start;
