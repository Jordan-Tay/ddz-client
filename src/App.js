import React, { useEffect, useState } from 'react';
import { socket, SocketContext } from './context/socket';
import { Game, Start } from './screens';
import { Backdrop, createTheme, responsiveFontSizes, ThemeProvider, useMediaQuery, useTheme } from '@mui/material';

let theme = createTheme({
  typography: {
    'fontFamily': 'Montserrat'
  },
})
theme = responsiveFontSizes(theme);

const App = () => {
  const [roomId, setRoomId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');

  return (
    <SocketContext.Provider value={socket}>
      <ThemeProvider theme={theme}>
        <div className="App">
          {!roomId && <Start name={name} setName={setName} setRoomId={setRoomId} setUserId={setUserId} />}
          {roomId && <Game name={name} roomId={roomId} userId={userId} />}
        </div>
      </ThemeProvider>
    </SocketContext.Provider>
  );
}

export default App;
