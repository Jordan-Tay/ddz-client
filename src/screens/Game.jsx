import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import { Card } from '../components';
import Button from '../components/Button';
import CardStack from '../components/CardStack';
import { combination, decodeCard, sortEncoded } from '../utils';
import { SocketContext } from '../context/socket';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Chip, Divider, IconButton, Snackbar, Tooltip } from '@mui/material';

const chunk = Array.from(Array(54).keys()).map(i => i + 1).sort(() => 0.5 - Math.random()).slice(0, 17).sort((id_a, id_b) => {
  const { rank: ra, suit: sa } = decodeCard(id_a);
  const { rank: rb, suit: sb } = decodeCard(id_b);
  return ra - rb === 0 ? sb - sa : ra - rb;
});

export const Game = ({ name, roomId, userId }) => {
  const [hand, setHand] = useState([]);
  const [rightHand, setRightHand] = useState([]);
  const [leftHand, setLeftHand] = useState([]);
  const [selected, setSelected] = useState([]);
  const [turn, setTurn] = useState(null);
  const [lastPlayedBy, setLastPlayedBy] = useState(null);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [message, setMessage] = useState('Waiting...');
  const [end, setEnd] = useState(false);
  const [rightPlayer, setRightPlayer] = useState('');
  const [leftPlayer, setLeftPlayer] = useState('');

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on('players', (players) => {
      setRightPlayer(players[(userId + 1) % 3] || '');
      setLeftPlayer(players[(userId + 2) % 3] || '');
    });
    socket.on('start-game', (hands) => {
      setHand(sortEncoded(hands[userId]));
      setRightHand(sortEncoded(hands[(userId + 1) % 3]));
      setLeftHand(sortEncoded(hands[(userId + 2) % 3]));
    });
    socket.on('turn', ({ player, lastPlayedBy, lastPlayed }) => {
      setTurn(player);
      setLastPlayedBy(lastPlayedBy);
      setLastPlayed(lastPlayed);
    });
    socket.on('win', (player) => {
      setEnd(true);
      if (player === userId) {
        setMessage('Woohoo you won!');
      } else {
        setMessage(`${player} won... Ez clap`);
      }
    });
    return () => {
      socket.off('players');
      socket.off('start-game');
      socket.off('turn');
      socket.off('win');
    }
  }, [socket, userId]);

  useEffect(() => {
    let selectedData = combination(selected);
    if (selectedData) {
      console.log(selectedData.play);
    }
  }, [selected]);

  const selectedData = combination(selected);
  let legal;
  if (selectedData === null) {
    legal = false;
  } else if (lastPlayed === null) {
    legal = true;
  } else if (lastPlayed.combi === 'rocket') {
    legal = true;
  } else if (lastPlayed.combi === 'bomb') {
    legal = selectedData.combi === 'rocket' || (selectedData.combi === 'bomb' || selectedData.repr > lastPlayed.repr);
  } else {
    legal = selectedData.combi === 'bomb' || (selectedData.combi === lastPlayed.combi && selectedData.repr > lastPlayed.repr);
  }

  const handleClickCard = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handlePlay = () => {
    const newHand = hand.filter(id => !selected.includes(id));
    setHand(newHand);
    setSelected([]);
    if (newHand.length === 0) {
      socket.emit('win', {
        roomId,
        userId
      })
    } else {
      socket.emit('play', {
        roomId,
        turn: {
          player: (userId + 1) % 3,
          lastPlayedBy: userId,
          lastPlayed: selectedData
        }
      });
    }
  };

  const handlePass = () => {
    socket.emit('play', {
      roomId,
      turn: {
        player: (userId + 1) % 3,
        lastPlayedBy,
        lastPlayed
      }
    });
  }

  return (
    <div>
      <Snackbar autoHideDuration={2000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)} message="Room ID copied to clipboard" />
      <div style={{ height: '60vh', display: 'flex' }}>
        <div style={{ width: '20%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            {leftPlayer}
          </div>
          <CardStack size='s'>
            {leftHand.map(id => <Card key={id} id={id} back />)}
          </CardStack>
        </div>
        <div style={{ width: '60%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 40px', borderLeft: '1px solid', borderRight: '1px solid', boxSizing: 'border-box', flexDirection: 'column' }}>
          <div style={{  
            position: 'absolute',
            top: '10px',
            border: '1px solid grey',
            borderRadius: '8px',
            padding: '5px 10px',
            textAlign: 'center',
            fontSize: '20px',
            boxSizing: 'border-box',
            margin: '10px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <div>{roomId}</div>
            <Divider sx={{ mx: 1.5, my: 0.5, border: 'solid 1px grey' }} orientation='vertical' flexItem />
            <Tooltip title='Copy Room ID'>
              <IconButton onClick={() => {
                navigator.clipboard.writeText(roomId);
                setSnackbarOpen(true);
              }}>
                <ContentCopyIcon sx={{ cursor: 'pointer' }} />
              </IconButton>
            </Tooltip>
          </div>
          <CardStack size='l'>
            {lastPlayed && lastPlayed.play.map(id => <Card key={id} id={id} />)}
          </CardStack>
        </div>
        <div style={{ width: '20%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            {rightPlayer}
          </div>
          <CardStack size='s'>
            {rightHand.map(id => <Card key={id} id={id} back />)}
          </CardStack>
        </div>
      </div>
      <div style={{ height: '40vh', display: 'flex', borderTop: '1px solid', boxSizing: 'border-box' }}>
        <div style={{ width: '80%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 40px', borderRight: '1px solid' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            {name}
          </div>
          {turn !== null && <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <Chip label={`${turn}'s move`} color={turn === userId ? 'success' : 'warning'} />
          </div>}
          {hand.length === 0 || end
            ? <>{message}</>
            : <CardStack size='m'>
              {hand.map(id => <Card key={id} id={id} onClick={() => handleClickCard(id)} />)}
            </CardStack>}
        </div>
        <div style={{ width: '20%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 40px' }}>
          <Button label={end ? 'Rematch' : 'Play'} onClick={handlePlay} disabled={turn !== userId || !legal} />
          <Button label={end ? 'Home' : 'Pass'} onClick={handlePass} disabled={turn !== userId || lastPlayed === null} />
        </div>
      </div>
    </div>
  );
}

export default Game;
