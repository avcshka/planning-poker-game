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

type TRoomId = string | string[];

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

    let roomId: TRoomId | undefined = socket.handshake.query['roomId'];
    if (!roomId) {
      roomId = uuidv4();
      socket.emit('room', roomId);
    }
    socket.join(roomId);

    socket.on('name', (name) => {
      const player: IPlayer | undefined = players.find((p: IPlayer) => p.id === socket.id);
      console.log("User entered name: ", name);

      if (!player) {
        players.push({ id: socket.id, name, roomId });
      }

      updatePlayersInRoom(roomId);
      restartGame(roomId);
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

      updatePlayersInRoom(roomId);
    });

    socket.on('show', () => {
      showVotes(roomId);
    });

    socket.on('send_message', ({message, name}) => {
      console.log("message + name", message, name)
      receiveMessages(roomId, message, name);
    })

    socket.on('restart', () => {
      restartGame(roomId);
    });

    socket.on('disconnect', () => {
      const player: IPlayer | undefined = players.find((p: IPlayer) => p.id === socket.id);
      console.log(`Player ${ player?.name } disconnected`);

      players = players.filter((p: IPlayer) => p.id !== socket.id);

      updatePlayersInRoom(roomId);
    });
  });

  function updatePlayersInRoom(roomId: TRoomId) {
    const playersInRoom: IPlayer[] = players.filter((p: IPlayer) => p.roomId === roomId);

    io.to(roomId).emit('update', {
      players: playersInRoom,
    })
  }

  function receiveMessages(roomId: TRoomId, message: string, name: string) {
    io.to(roomId).emit('receive_message', {message, name});
  }

  function showVotes(roomId: TRoomId) {
    const average = getAverage(roomId);
    io.to(roomId).emit('show', { average: average });
  }

  function getAverage(roomId: TRoomId) {
    const roomPlayers: IPlayer[] = players.filter((p: IPlayer) => p.roomId === roomId);

    let count: number = 0;
    let total: number = 0;

    for (const player of roomPlayers) {
      if (player.vote && player.vote !== "?") {
        const numberValue: number = Number(player.vote);

        total += numberValue;
        count++;
      }
    }

    return  count > 0 ? Math.floor(total / count) : 0;
  }

  function restartGame(roomId: TRoomId) {
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
    const allRoomsId: (TRoomId)[] = players.map((p: IPlayer) => p.roomId);
    const uniqueRoomsId = allRoomsId.filter((roomId: TRoomId, i: number, allRoomsId: (TRoomId)[]) => allRoomsId.indexOf(roomId) === i);

    if (allRoomsId) {
      for (const roomId of uniqueRoomsId) {
        const playersInRoom = players.filter((p: IPlayer) => p.roomId === roomId);
        const playerNames = playersInRoom.map((p: IPlayer) => p.name);

        console.log(`Room: ${ roomId } - Players: ${ playerNames.join(", ") }`);
      }
    }
  }

  httpServer.listen(3000);
  console.log(`Server listening on port ${port}`);
})



