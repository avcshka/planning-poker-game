import { useEffect, useRef } from "react";
import { IPlayer } from "@/app/lib/types/types";
import { io, Socket } from "socket.io-client";

interface ISocketProps {
  roomId: string;
  savedName: string;
  setSelected: (s: string) => void;
  setAverage: (n: number | null) => void;
  setPlayers: (p: IPlayer[]) => void;
  setCountdown: (n: number | null) => void;
}

export const useSocket = ({
                            roomId,
                            savedName,
                            setSelected,
                            setAverage,
                            setPlayers,
                            setCountdown,
                          }: ISocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      query: { roomId },
    });

    socket.emit('name', savedName);

    socket.on('update', ({ players }: { players: IPlayer[] }) => {
      setPlayers(players);
    });

    socket.on('restart', () => {
      setSelected('');
      setAverage(null);
      setCountdown(null);
    });

    socket.on('show', ({ average }: { average: number }) => {
      setAverage(average);
      setCountdown(3);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };

  }, [roomId, savedName])


  return socketRef;
}