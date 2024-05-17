export interface payloadMessage extends SelectedPiece {
  id: string;
  name: string;
  path?: string;
  board?: any;
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
