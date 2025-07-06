'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DarkThemeSwitch from "@/app/components/dark-theme-switch";
import { useRoomStore } from "@/app/lib/store/useRoomStore";
import { useDebounce } from "@/app/lib/hooks/useDebounce";
import { useSocket } from "@/app/lib/hooks/useSocket";

export default function RoomPage() {
  const { roomId } = useParams();
  const cards: string[] = ['1', '2', '3', '5', '8', '13', '21', '?'];
  const [showEditName, setShowEditName] = useState(false);
  const {
    players, name, selected, average, countdown,
    setName, setPlayers, setSelected, setAverage,
    setCountdown, setRoomId
  } = useRoomStore();

  useEffect(() => {
    if (!roomId || typeof roomId !== 'string') return;
    setRoomId(roomId);

    const playerName: string = sessionStorage.getItem('poker_name') || '';
    setName(playerName);
  }, [roomId]);

  const debouncedName: string = useDebounce(name);

  const socketRef = useSocket({
    roomId: typeof roomId === 'string' ? roomId : '',
    savedName: debouncedName,
    setSelected,
    setAverage,
    setPlayers,
    setCountdown
  })

  useEffect(() => {
    if(!!debouncedName) {
      sessionStorage.setItem('poker_name', debouncedName);
      socketRef.current?.emit('name', debouncedName);
    }
  }, [debouncedName]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((countdown ?? 0) - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const vote = (value: string) => {
    setSelected(value);
    socketRef.current?.emit('vote', value);
  };

  const restart = () => {
    socketRef.current?.emit('restart');
  };

  const showVotes = () => {
    socketRef.current?.emit('show');
  };

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

  return (
    <div
      className="max-w-4xl mx-auto mt-10 p-6 bg-gray-100 shadow-md rounded-xl border dark:border-gray-500 dark:bg-gray-900 dark:shadow-lg transition-colors duration-300">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">Room</h1>

          <div className="flex gap-2">
            <button
              className="shadow-2xl bg-white py-2 px-3 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:shadow-lg transition-colors duration-200"
              onClick={ () => {
                const url: string = window.location.href;
                navigator.clipboard.writeText(url);
              } }
            >
              <img src="/svg/copy.svg" alt="Copy link" className="w-5 h-5 dark:invert"/>
            </button>

            <button
              className="shadow-2xl bg-white py-2 px-3 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:shadow-lg transition-colors duration-200"
              onClick={ () => setShowEditName(!showEditName) }
            >
              <img src="/svg/edit.svg" alt="Edit" className="w-5 h-5 dark:invert"/>
            </button>

            <DarkThemeSwitch/>
          </div>
        </div>

        { !showEditName && (
          <input
            className="mt-2 w-full border border-gray-200 bg-white text-black outline-none shadow-2xl p-2 rounded dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:shadow-lg transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter your name"
            value={ name }
            onChange={ handleChangeName }
          />
        ) }
      </div>

      <div className="flex items-center justify-center flex-row gap-6">
        { players.map((player, index) => {
          const allVoted = players.length > 0 && players.every((p) => p.vote && p.vote !== "");
          const showVote = allVoted && countdown === null;

          return (
            <div key={ index } className="flex flex-col items-center justify-center">
              <div
                className={ `flex text-2xl my-4 items-center h-[120px] w-[60px] rounded-2xl shadow-2xl transition-colors duration-300 ${
                  showVote && player.vote
                    ? "bg-blue-500 text-white dark:bg-blue-600"
                    : "bg-white text-black dark:bg-gray-800 dark:text-gray-300"
                }` }
              >
                <span className="mx-auto">{ showVote ? player.vote : "" }</span>
              </div>
              <div className="my-3">
                <h2 className="text-xl font-medium text-black dark:text-white">{ player.name }</h2>
              </div>
            </div>
          );
        }) }
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        { cards.map((card) => (
          <button
            key={ card }
            className={ `px-4 py-2 rounded-2xl shadow-2xl transition-colors duration-200 ${
              selected === card ? "bg-blue-500 text-white dark:bg-blue-600" : "bg-white text-black dark:bg-gray-800 dark:text-gray-300"
            } hover:bg-blue-200 dark:hover:bg-blue-700` }
            onClick={ () => vote(card) }
          >
            { card }
          </button>
        )) }
      </div>

      { countdown !== null && (
        <div className="text-center text-2xl font-bold mb-4 text-black dark:text-white">{ countdown }</div>
      ) }

      { countdown === null && average !== null && (
        <p className="text-center font-semibold mb-4 text-black dark:text-white">Average Vote: { average }</p>
      ) }

      <div className="flex gap-2 pt-5 justify-center">
        <button
          onClick={ showVotes }
          disabled={ !!countdown }
          className="bg-white shadow-2xl hover:bg-green-200 dark:bg-gray-800 dark:hover:bg-green-700 dark:shadow-lg text-black dark:text-white px-6 py-4 rounded-2xl transition-colors duration-200"
        >
          Show Votes
        </button>
        <button
          onClick={ restart }
          className="bg-white shadow-2xl hover:bg-yellow-200 dark:bg-gray-800 dark:hover:bg-yellow-600 dark:shadow-lg text-black dark:text-white px-6 py-4 rounded-2xl transition-colors duration-200"
        >
          Restart
        </button>
      </div>
    </div>
  );
}