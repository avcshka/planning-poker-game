import { createServer } from 'node:http';
import next from 'next';
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';

interface IPlayer {
  id: string;
  name: string;
  roomId: string | string[];
  vote?: string;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000");
const nextApp = next({ dev, hostname, port })
const handler = nextApp.getRequestHandler();

let players: IPlayer[] = [];

nextApp.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  setInterval(() => {
    io.emit('ping');
    logRooms();
  }, 20000);

  io.on('connection', (socket: Socket) => {
    console.log("A user connected", socket.id);

    let roomId: string | string[] | undefined = socket.handshake.query['roomId'];
    if (!roomId) {
      roomId = uuidv4();
      socket.emit("room", roomId);
    }
    socket.join(roomId);

    socket.on('name', (name) => {
      const player: IPlayer | undefined = players.find((p: IPlayer) => p.id === socket.id);
      console.log("User entered name: ", name);

      if (!player) {
        players.push({ id: socket.id, name, roomId });
      }

      updateClientsInRoom(roomId);
    })

    socket.on('vote', (vote) => {
      const player: IPlayer | undefined = players.find((p: IPlayer) => p.id === socket.id);
      if (player) {
        player.vote = vote;
      }
      console.log(`Player ${ player?.name } voted ${ player?.vote }`);

      const playersInRoom: IPlayer[] = players.filter((p: IPlayer) => p.roomId === roomId);
      if (playersInRoom.every((p: IPlayer) => p.vote)) {
        showVotes(roomId);
      }

      updateClientsInRoom(roomId);
    });

    socket.on('show', () => {
      showVotes(roomId);
    });

    socket.on('restart', () => {
      restartGame(roomId);
    });

    socket.on('disconnect', () => {
      const player: IPlayer | undefined = players.find((p: IPlayer) => p.id === socket.id);
      console.log(`Player ${ player?.name } disconnected`);

      players = players.filter((p: IPlayer) => p.id !== socket.id);

      updateClientsInRoom(roomId);
    });
  });

  function updateClientsInRoom(roomId: string | string[]) {
    const roomPlayers: IPlayer[] = players.filter((p: IPlayer) => p.roomId === roomId);

    io.to(roomId).emit('update', {
      players: roomPlayers,
    })
  }

  function showVotes(roomId: string | string[]) {
    const average = Math.round(getAverage(roomId))
    io.to(roomId).emit('show', { average: average });
  }

  function getAverage(roomId: string | string[]) {
    const roomPlayers: IPlayer[] = players.filter((p: IPlayer) => p.roomId === roomId);

    let count: number = 0;
    let total: number = 0;

    for (const player of roomPlayers) {
      if (player.vote && player.vote !== "?") {
        const index = 0;
        let numberValue: number = Number(player.vote);
        if (isNaN(numberValue)) {
          numberValue = index;
        }

        total += parseInt(String(numberValue));
        count++;
      }
    }

    return total / count;
  }

  function restartGame(roomId: string | string[]) {
    const roomPlayers: IPlayer[] = players.filter((p: IPlayer) => p.roomId === roomId);

    roomPlayers.forEach((p: IPlayer) => {
      p.vote = undefined;
    });

    console.log(`Restarted game with Players: ${ roomPlayers.map(p => p.name).join(", ") }`);
    io.to(roomId).emit('restart');
    io.to(roomId).emit('update', {
      players: roomPlayers,
    });
  }

  function logRooms() {
    const rooms: (string | string[])[] = players.map((p: IPlayer) => p.roomId);

    if (rooms) {
      for (const room of rooms.filter((val: string | string[], i: number, arr: (string | string[])[]) => arr.indexOf(val) === i)) {
        const playersInRoom: string[] = players.filter((p: IPlayer) => p.roomId === room).map((p: IPlayer) => p.name);

        console.log(`Room: ${ room } - Players: ${ playersInRoom.join(", ") }`);
      }
    }
  }

  httpServer.listen(3000);
  console.log('Server listening on port 3000');
})



