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
import { payloadMessage } from "./type";
import { PayloadMessageDto } from "./dto";

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("AppGateway");

  @SubscribeMessage("msgToServer")
  handleMessage(client: Socket, payload: payloadMessage): void {
    const payloadDto = new PayloadMessageDto(payload);
    this.server.emit(`msgToClient:${payloadDto.path}`, payload, client.id);
  }

  @SubscribeMessage("msgToServerGetAllUsers")
  getAllUsers(client: Socket, payload: any): void {
    this.server.emit(`msgToClient:${payload.path}`, payload, client.id);
  }

  afterInit() {
    this.logger.log("Iniciado");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconected: ${client.id}`);
  }
}
