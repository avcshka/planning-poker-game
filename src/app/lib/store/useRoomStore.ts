import { create } from 'zustand';

interface Participant {
  name: string;
  vote?: string;
}

interface RoomState {
  roomId: string;
  name: string;
  players: Participant[];
  revealed: boolean;
  setVote: (vote: string) => void;
  reset: () => void;
  updatePlayers: (p: Participant[]) => void;
  setRevealed: (r: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: '',
  name: '',
  players: [],
  revealed: false,
  setVote: (vote) => {
    set((state) => {
      const updated = state.players.map((p) =>
        p.name === state.name ? { ...p, vote } : p
      );
      return { players: updated };
    });
  },
  reset: () => set({ revealed: false, players: [] }),
  updatePlayers: (p) => set({ players: p }),
  setRevealed: (r) => set({ revealed: r }),
}));
