import { locales } from "@/resources";
import { io } from "socket.io-client";

const connection =
  locales.enviroment == "production"
    ? locales.socketApi
    : `${locales.socketHost}:${locales.socketPort}`;

export class SocketCliente {
  async get(emit: string, on: string, dadosEnvio: any): Promise<any> {
    const socket = io(connection, {
      transports: ["websocket"],
    });
    const result: any = await new Promise(function (resolve) {
      const reponseTimeout = setTimeout(() => {
        resolve([]);
      }, 10000);
      socket.emit(emit, dadosEnvio);
      socket.on(on, (mensagem: any) => {
        clearTimeout(reponseTimeout);
        resolve(mensagem);
      });
    });
    socket.disconnect();
    return result;
  }

  async emit(emit: string, dadosEnvio: any) {
    const socket = io(connection, {
      transports: ["websocket"],
    });
    return socket.emit(emit, dadosEnvio);
  }

  async on(on: string) {
    const socket = io(connection, {
      transports: ["websocket"],
    });
    const result: any = await new Promise(function (resolve) {
      const reponseTimeout = setTimeout(() => {
        resolve([]);
      }, 20000);
      socket.on(on, (mensagem: any) => {
        clearTimeout(reponseTimeout);
        resolve(mensagem);
      });
    });
    socket.disconnect();
    return result;
  }
}
