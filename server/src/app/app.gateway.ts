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
import { PayloadMessageDto } from "./dto";
import { payloadMessage, Player } from "./type";

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
    const userConnetion: any = client.handshake.query;

    if (userConnetion.userId) {
      const userRooms = this.server.sockets.adapter.rooms.get(
        userConnetion.roomId
      );
      const typeUser = this.typeUser(userRooms);
      userSocketMap.set(userConnetion.userId, {
        socketId: client.id,
        typeUser,
      });
      client.join(userConnetion.roomId);
      this.server.to(client.id).emit("typeUser", typeUser);
      console.log(
        `User connecter: ${userConnetion.userId} with socket ID ${client.id}`
      );
    } else {
      console.log(`User ID not provided during connection`);
    }
  }

  private typeUser(userRooms: Set<string>) {
    if (!userRooms) {
      return "PRIMARY";
    }
    if (userRooms.size === 1) {
      return "SECUNDARY";
    }
    return "VISITOR";
  }

  @SubscribeMessage("emitMovePiece")
  handleMessage(client: Socket, payload: payloadMessage): void {
    let userReceiveds = [];
    let typeUserMessage = null;
    for (const [userId, { socketId, typeUser }] of userSocketMap.entries()) {
      if (userId !== payload.userId) {
        userReceiveds.push(socketId);
      } else typeUserMessage = typeUser;
    }
    if (typeUserMessage === "VISITOR") return;
    const payloadDto = new PayloadMessageDto(payload);
    if (payloadDto.roomId) {
      this.server.to(payloadDto.roomId).emit("receivedMovePieceList", payload);
      this.server.to(userReceiveds).emit("pieceMovement", payload);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconected: ${client.id}`);

    const userConnetion: any = client.handshake.query;
    for (const [userId, { socketId }] of userSocketMap.entries()) {
      if (socketId === client.id) {
        client.leave(userConnetion.roomId);
        userSocketMap.delete(userId);
        break;
      }
    }
  }
}
