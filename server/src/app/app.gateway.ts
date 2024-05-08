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
  //private rooms: GameRoom[] = [];

  @SubscribeMessage("msgToServer")
  handleMessage(client: Socket, payload: payloadMessage): void {
    const payloadDto = new PayloadMessageDto(payload);
    this.server.emit(`msgToClient:${payloadDto.path}`, payload, client.id);
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(
    client: Socket,
    payload: { roomId: string; playerName: string }
  ): void {
    const { roomId, playerName } = payload;
    const player: Player = { id: client.id, name: playerName, roomId };
    //this.rooms.push({ id: roomId });
    this.players.push(player);
    client.join(roomId);
    this.server.to(roomId).emit("playerList", this.getPlayerList(roomId));
  }

  getPlayerList(roomId: string): Player[] {
    return this.players.filter((player) => player.roomId === roomId);
  }

  afterInit() {
    this.logger.log("Iniciado");
  }

  handleConnection(client: Socket, payload: payloadMessage) {
    const playerIndex = this.players.findIndex(
      (player) => player.id === payload.id
    );
    if (playerIndex !== -1) {
      const { roomId } = this.players[playerIndex];
      this.players.splice(playerIndex, 1);
      this.server.to(roomId).emit("playerList", this.getPlayerList(roomId));
    }
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconected: ${client.id}`);
  }
}
