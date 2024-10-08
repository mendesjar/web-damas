import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { locales } from "src/resources";

const userSocketMap = new Map();
@WebSocketGateway({
  cors: {
    origin: locales.urlBase,
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("AppGateway");

  afterInit() {
    this.logger.log("Iniciado");
  }

  handleConnection(client: Socket) {
    const userConnetion = client.handshake.query;

    if (userConnetion.userId) {
      userSocketMap.set(userConnetion.userId, client.id);
      client.join(userConnetion.roomId);
      console.log(
        `User connecter: ${userConnetion.userId} with socket ID ${client.id}`
      );
    } else {
      console.log(`User ID not provided during connection`);
    }
  }

  @SubscribeMessage("emitMovePiece")
  handleMessage(client: Socket, payload): void {
    this.server.to(payload.roomId).emit("receivedMovePiece", payload);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconected: ${client.id}`);

    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === client.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  }
}
