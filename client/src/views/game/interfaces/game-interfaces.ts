export interface Message extends SelectedPiece {
  id: string;
  name: string;
  path?: string;
  board?: any;
}

export interface Board {
  piece?: {
    type: string | null;
    color?: string;
  };
  x: number;
  y: number;
  color: string;
}

export interface Payload {
  id: string;
  name: string;
  path: string;
}

export interface SelectedPiece {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}
