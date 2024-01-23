import { payloadMessage } from "../type";

export class PayloadMessageDto {
  id: string;
  name: string;
  path: string;
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  board: any;

  constructor(body: payloadMessage) {
    this.id = body.id;
    this.name = body.name;
    this.path = body.path;
    this.x = body.x;
    this.y = body.y;
    this.oldX = body.oldX;
    this.oldY = body.oldY;
    this.board = body.board;
  }
}
