import { payloadMessage } from "../type";

export class PayloadMovementDto {
  senderUserId: string;
  roomId: string;
  x: number;
  y: number;
  oldX: number;
  oldY: number;

  constructor(body: payloadMessage) {
    this.senderUserId = body.userId;
    this.x = body.x;
    this.y = body.y;
    this.oldX = body.oldX;
    this.oldY = body.oldY;
  }
}
