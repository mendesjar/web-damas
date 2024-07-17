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
import { strings } from "../resources";

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
      this.server.emit(`msgToClient:${payloadDto.path}`, payload);
    }
  }

  @SubscribeMessage("createRoom")
  handleCreateRoom(client: Socket, payload: Player): void {
    const { RESPONSE_ERROR } = strings;
    const createdRoom = this.rooms.find(
      (room) =>
        room.id === payload.roomId &&
        room.playersId.some((id) => id === payload.id)
    );
    if (!createdRoom) {
      const player: Player = {
        id: payload.id,
        userName: payload.userName,
        roomId: payload.roomId,
      };
      this.rooms.push({ id: payload.roomId, playersId: [payload.id] });
      this.players.push(player);
      this.server.emit(
        `sendCreateRoom:${payload.id}`,
        this.validGameRoom(true)
      );
    } else {
      this.server.emit(
        `sendCreateRoom:${payload.id}`,
        this.validGameRoom(false, RESPONSE_ERROR)
      );
    }
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(client: Socket, payload: Player): void {
    const { RESPONSE_ERROR } = strings;
    const createdRoom = this.rooms.find(
      (room) =>
        room.id === payload.roomId &&
        room.playersId.some((id) => id === payload.id)
    );
    if (!createdRoom) {
      const player: Player = {
        id: payload.id,
        userName: payload.userName,
        roomId: payload.roomId,
      };
      this.rooms.map((room) => {
        if (room.id === payload.roomId) {
          return {
            ...room,
            playersId: room.playersId.push(payload.id),
          };
        } else return room;
      });
      this.players.push(player);
      this.server.emit(`sendJoinRoom:${payload.id}`, this.validGameRoom(true));
      this.server.emit(
        `playerList:${payload.roomId}`,
        this.getPlayerList(client, payload)
      );
    } else {
      this.server.emit(
        `sendJoinRoom:${payload.id}`,
        this.validGameRoom(false, RESPONSE_ERROR)
      );
    }
  }

  private validGameRoom(valid: boolean, message?: string) {
    return {
      isValid: valid,
      responseMessage: message,
    };
  }

  @SubscribeMessage("getPlayerList")
  getPlayerList(client: Socket, payload: any): void {
    const valid = this.players.some(
      (player) => player.id === payload.id && player.roomId === payload.roomId
    );
    if (valid) {
      const playerList = this.players.filter(
        (player) => player.roomId === payload.roomId
      );
      this.server.emit(`playerList:${payload.roomId}`, playerList);
    }
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
