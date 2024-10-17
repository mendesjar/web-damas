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
import { PayloadMessageDto, PayloadMovementDto } from "./dto";
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
        userName: userConnetion.userName,
        typeUser,
      });
      client.join(userConnetion.roomId);
      this.server.to(client.id).emit("typeUser", typeUser);
      if (typeUser === "SECUNDARY") {
        const usersStartGame = this.startGame(
          userRooms,
          userConnetion.userName,
          client.id
        );
        this.server.to(userConnetion.roomId).emit("validStartGame", {
          isValid: true,
          users: usersStartGame,
        });
      }
      console.log(
        `User connecter: ${userConnetion.userId} with socket ID ${client.id}`
      );
    } else {
      console.log(`User ID not provided during connection`);
    }
  }

  private startGame(
    userRooms: Set<string>,
    userSecundaryName: string,
    clientId: string
  ) {
    const differentKey = Array.from(userRooms).find((key) => key !== clientId);
    const primaryUser = Array.from(userSocketMap).find(
      (key) => key[1]["socketId"] === differentKey
    );
    return {
      primary: userSecundaryName,
      secundary: primaryUser[1]["userName"],
    };
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
    const payloadDto = new PayloadMessageDto(payload);
    if (payloadDto.roomId) {
      const payloadListMove = new PayloadMovementDto(payload);
      this.server
        .to(payloadDto.roomId)
        .emit("receivedMovePieceList", payloadListMove);
      if (userReceiveds?.length)
        this.server.to(userReceiveds).emit("pieceMovement", payloadDto);
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
