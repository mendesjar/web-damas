export interface Message extends SelectedPiece {
  userId: string;
  name: string;
  path?: string;
  board?: any;
}

export interface Board {
  piece?: {
    type: PieceType;
    color?: string;
  };
  x: number;
  y: number;
  color: SquardColor;
}

type SquardColor = "bg-white" | "bg-black";
type PieceType = "pawn" | null;

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
