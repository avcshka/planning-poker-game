export interface IPlayer {
  id: string;
  name: string;
  vote?: string;
}

export interface ITicket {
  roomId: string;
  votingOn?: boolean;
  score?: number;
  name: string;
}
