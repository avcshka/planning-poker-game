'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import DarkThemeSwitch from "@/app/components/dark-theme-switch";

export default function LobbyPage() {
  const [name, setName] = useState<string>('');
  const [clickedStart, setClickedStart] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const router = useRouter();

  const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
    if (clickedStart) {
      const timer = setTimeout(() => {
        if (!hasStarted) {
          alert(
            'Unable to connect to the server. Please check your internet connection or try again later.'
          );
          setClickedStart(false);
        }
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [clickedStart, hasStarted]);

  const startGame = () => {
    setClickedStart(true);
    registerSocket();
  };

  const registerSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000");

      localStorage.setItem('poker_name', name);
      socketRef.current.emit("name", name);

      socketRef.current.on("room", (roomId: string) => {
        setHasStarted(true);
        router.push(`/room/${ roomId }`);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Join Planning Game</h1>

      <DarkThemeSwitch/>

      <input
        className="border px-4 py-2 rounded w-full max-w-xs"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />

      <button
        onClick={startGame}
        disabled={!name || clickedStart}
        className={`text-white px-4 py-2 rounded ${name ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
      >
        {clickedStart ? 'Connecting...' : 'Join Room'}
      </button>
    </div>
  );
}