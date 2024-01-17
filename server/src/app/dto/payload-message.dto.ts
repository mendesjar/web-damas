import { payloadMessage } from "../type";

export class PayloadMessageDto {
  nome: string;
  path: string;

  constructor(body: payloadMessage) {
    this.nome = body.nome;
    this.path = body.path;
  }
}
