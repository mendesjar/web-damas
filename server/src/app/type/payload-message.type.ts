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
