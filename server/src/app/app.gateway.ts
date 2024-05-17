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
import { payloadMessage, Player, GameRoom } from "./type";
import { PayloadMessageDto } from "./dto";

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("AppGateway");
  private players: Player[] = [];
  private rooms: GameRoom[] = [];

  @SubscribeMessage("msgToServer")
  handleMessage(client: Socket, payload: payloadMessage): void {
    if (payload.path) {
      const payloadDto = new PayloadMessageDto(payload);
      client.join(payloadDto.path);
      this.server
        .to(payloadDto.path)
        .emit(`msgToClient:${payloadDto.path}`, payload, client.id);
    }
  }

  @SubscribeMessage("createRoom")
  handleCreateRoom(client: Socket, payload: Player): void {
    const createdRoom = this.rooms.find(
      (room) =>
        room.id === payload.roomId &&
        room.playersId.some((id) => id === client.id)
    );
    if (!createdRoom) {
      const player: Player = {
        id: client.id,
        userName: payload.userName,
        roomId: payload.roomId,
      };
      this.rooms.push({ id: payload.roomId, playersId: [client.id] });
      this.players.push(player);
      const playerList = this.getPlayerList(payload.roomId);
      this.server.emit(`playerList:${payload.roomId}`, playerList);
    }
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(client: Socket, payload: Player): void {
    const player: Player = {
      id: client.id,
      userName: payload.userName,
      roomId: payload.roomId,
    };
    this.rooms.map((room) => {
      if (room.id === payload.roomId) {
        return {
          ...room,
          playersId: room.playersId.push(client.id),
        };
      } else return room;
    });
    this.players.push(player);
    const playerList = this.getPlayerList(payload.roomId);
    this.server.emit(`playerList:${payload.roomId}`, playerList);
  }

  private getPlayerList(roomId: string): Player[] {
    return this.players.filter((player) => player.roomId === roomId);
  }

  afterInit() {
    this.logger.log("Iniciado");
  }

  handleConnection(client: Socket, payload: payloadMessage) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.players = this.players.filter((player) => player.id !== client.id);
    this.logger.log(`Client disconected: ${client.id}`);
  }
}
