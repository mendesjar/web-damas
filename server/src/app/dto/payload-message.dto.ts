import { payloadMessage } from "../type";

export class PayloadMessageDto {
  userId: string;
  name: string;
  roomId: string;
  x: number;
  y: number;
  oldX: number;
  oldY: number;

  constructor(body: payloadMessage) {
    this.userId = body.userId;
    this.name = body.name;
    this.roomId = body.roomId;
    this.x = body.x;
    this.y = body.y;
    this.oldX = body.oldX;
    this.oldY = body.oldY;
  }
}
