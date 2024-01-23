export interface Message {
  id: string;
  name: string;
  x: string;
  y: string;
}

export interface Board {
  piece?: {
    type: string;
    color: string;
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
}
