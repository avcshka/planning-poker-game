import { create } from 'zustand';
import { IPlayer } from "@/app/lib/types/types";

interface RoomState {
  roomId: string;
  name: string;
  players: IPlayer[];
  selected: string;
  average: number | null;
  countdown: number | null;
  setRoomId: (id: string) => void;
  setName: (name: string) => void;
  setPlayers: (players: IPlayer[]) => void;
  setSelected: (card: string) => void;
  setAverage: (avg: number | null) => void;
  setCountdown: (n: number | null) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: '',
  name: '',
  players: [],
  selected: '',
  average: null,
  countdown: null,
  setRoomId: (id) => set({ roomId: id }),
  setName: (name) => set({ name }),
  setPlayers: (players) => set({ players }),
  setSelected: (card) => set({ selected: card }),
  setAverage: (avg) => set({ average: avg }),
  setCountdown: (n) => set({ countdown: n }),
  reset: () => set({
    players: [],
    selected: '',
    average: null,
    countdown: null
  }),
}));
