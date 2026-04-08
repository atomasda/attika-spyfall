import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { seedDatabase, getRandomLocationRoles, getAllLocations } from './db';

// Seed the DB on startup
seedDatabase();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

type Player = {
  id: string;
  nickname: string;
  isHost: boolean;
  role?: any; 
  isSpy?: boolean;
};

type GameState = 'lobby' | 'playing' | 'voting' | 'finished';

type Room = {
  roomId: string;
  players: Player[];
  status: GameState;
  startTime?: number;
  timeLimitSeconds?: number;
  selectedLocation?: any;
  votes: Record<string, string>; // voterId -> votedPlayerId
  eliminatedPlayers: string[]; // List of IDs who are eliminated
};

const rooms = new Map<string, Room>();

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', ({ roomId, nickname }, callback) => {
    socket.join(roomId);

    let room = rooms.get(roomId);
    if (!room) {
      room = { roomId, players: [], status: 'lobby', votes: {}, eliminatedPlayers: [] };
      rooms.set(roomId, room);
    }

    let existingPlayer = room.players.find(p => p.nickname === nickname);

    if (existingPlayer) {
      existingPlayer.id = socket.id; 
      callback({ success: true, players: room.players, status: room.status });
      io.to(roomId).emit('lobby_update', room.players);
      
      if (room.status !== 'lobby') {
        io.to(roomId).emit('game_status', room.status);
        if (room.status === 'playing') {
          io.to(socket.id).emit('game_started', { status: room.status, startTime: room.startTime!, timeLimitSeconds: room.timeLimitSeconds! });
        }
        const payload = {
          isSpy: existingPlayer.isSpy,
          location: existingPlayer.isSpy ? null : room.selectedLocation,
          role: existingPlayer.isSpy ? null : existingPlayer.role,
          allLocations: existingPlayer.isSpy ? getAllLocations() : null
        };
        io.to(socket.id).emit('secret_role_assigned', payload);
      }
      return;
    }

    const isHost = room.players.length === 0;
    const newPlayer: Player = { id: socket.id, nickname, isHost };

    room.players.push(newPlayer);
    callback({ success: true, players: room.players, status: room.status });
    io.to(roomId).emit('lobby_update', room.players);
    
    if (room.status !== 'lobby') io.to(roomId).emit('game_status', room.status);
  });

  socket.on('start_game', ({ roomId, timeLimitSeconds, spyCount = 1 }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.status = 'playing';
    room.timeLimitSeconds = timeLimitSeconds || 300; 
    room.startTime = Date.now();
    room.eliminatedPlayers = [];

    const result = getRandomLocationRoles();
    if (!result) return;
    
    room.selectedLocation = result.location;
    const availableRoles = result.roles;

    const actualSpyCount = Math.min(spyCount, room.players.length - 1) || 1;
    const spyIndices = new Set<number>();
    while (spyIndices.size < actualSpyCount && spyIndices.size < room.players.length) {
       spyIndices.add(Math.floor(Math.random() * room.players.length));
    }
    
    let roleIndex = 0;
    
    room.players.forEach((p, index) => {
      if (spyIndices.has(index)) {
        p.isSpy = true;
        p.role = null;
      } else {
        p.isSpy = false;
        if (availableRoles && availableRoles.length > 0) {
            p.role = availableRoles[roleIndex % availableRoles.length];
            roleIndex++;
        }
      }
    });

    const allLocations = getAllLocations();

    io.to(roomId).emit('game_started', {
      status: room.status, 
      startTime: room.startTime, 
      timeLimitSeconds: room.timeLimitSeconds 
    });

    room.players.forEach(p => {
      const payload = {
        isSpy: p.isSpy,
        location: p.isSpy ? null : room.selectedLocation,
        role: p.isSpy ? null : p.role,
        allLocations: p.isSpy ? allLocations : null
      };
      io.to(p.id).emit('secret_role_assigned', payload);
    });
  });

  // MILESTONE 4: Voting & Guessing mechanics
  socket.on('accuse_player', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;
    room.status = 'voting';
    room.votes = {}; // reset votes
    io.to(roomId).emit('game_status', 'voting');
    io.to(roomId).emit('vote_update', room.votes);
  });

  // Handle timer running out!
  socket.on('time_up', ({ roomId }) => {
     const room = rooms.get(roomId);
     if (!room || room.status !== 'playing') return;
     
     room.status = 'finished';
     io.to(roomId).emit('game_ended', { 
         winner: 'spy',
         reason: 'Time is up! The Spy escaped successfully! ⏳'
      });
  });

  socket.on('cast_vote', ({ roomId, votedPlayerId }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'voting') return;
    
    // Record vote
    room.votes[socket.id] = votedPlayerId;
    io.to(roomId).emit('vote_update', room.votes);

    // Check if everyone STILL ALIVE has voted
    const activePlayers = room.players.filter(p => !room.eliminatedPlayers.includes(p.id));
    const totalVotes = Object.keys(room.votes).length;
    
    if (totalVotes === activePlayers.length) {
      // Tally votes
      const tallies: Record<string, number> = {};
      Object.values(room.votes).forEach(vid => {
        tallies[vid] = (tallies[vid] || 0) + 1;
      });

      // Find player with most votes
      let maxVotes = 0;
      let accusedId = '';
      for (const [vid, count] of Object.entries(tallies)) {
        if (count > maxVotes) {
          maxVotes = count;
          accusedId = vid;
        }
      }

      // Check if that player was the Spy
      const accusedPlayer = room.players.find(p => p.id === accusedId);
      const isSpyCaught = accusedPlayer && accusedPlayer.isSpy;

      if (isSpyCaught) {
        // Game Over - Players Win!
        room.status = 'finished';
        io.to(roomId).emit('game_ended', { 
           winner: 'players',
           reason: `Spy (${accusedPlayer?.nickname}) was successfully caught! 🎉`
        });
      } else {
        // Wrong person accused! ELIMINATE THEM.
        if (accusedId && !room.eliminatedPlayers.includes(accusedId)) {
           room.eliminatedPlayers.push(accusedId);
        }
        
        // Let's analyze if Spies win by default now
        const aliveSpies = room.players.filter(p => p.isSpy && !room.eliminatedPlayers.includes(p.id)).length;
        const aliveNormal = room.players.filter(p => !p.isSpy && !room.eliminatedPlayers.includes(p.id)).length;
        
        if (aliveSpies >= aliveNormal) {
           room.status = 'finished';
           io.to(roomId).emit('game_ended', { 
              winner: 'spy',
              reason: `Wrong person accused! Too many innocents died. Spies wiped out the town! 💀`
           });
        } else {
           // Continue Game!
           room.status = 'playing';
           io.to(roomId).emit('game_status', 'playing');
        }
      }
      
      // Always broadcast eliminated players
      io.to(roomId).emit('eliminated_update', room.eliminatedPlayers);
    }
  });

  socket.on('spy_guess', ({ roomId, selectedLocationId }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;
    room.status = 'finished';
    const isCorrect = selectedLocationId === room.selectedLocation.id;
    io.to(roomId).emit('game_ended', { 
       winner: isCorrect ? 'spy' : 'players',
       reason: isCorrect ? 'Spy guessed correctly!' : 'Spy guessed wrong!'
    });
  });

  socket.on('back_to_lobby', ({ roomId }) => {
     const room = rooms.get(roomId);
     if (!room) return;
     room.status = 'lobby';
     io.to(roomId).emit('game_status', 'lobby');
     io.to(roomId).emit('lobby_update', room.players);
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        let room = rooms.get(roomId);
        if (room && room.status === 'lobby') {
          room.players = room.players.filter(p => p.id !== socket.id);
          if (room.players.length > 0) {
            if (!room.players.find(p => p.isHost)) room.players[0].isHost = true;
            io.to(roomId).emit('lobby_update', room.players);
          } else {
            rooms.delete(roomId);
          }
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
