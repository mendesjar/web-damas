export interface payloadMessage extends SelectedPiece {
  userId: string;
  name: string;
  roomId: string;
}

interface SelectedPiece {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

export interface Player {
  id?: string;
  userName: string;
  roomId: string;
}

export interface GameRoom {
  id: string;
  playersId: string[];
}
