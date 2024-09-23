import { Module } from '@nestjs/common';
import { SocketGateway } from './app/app.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketGateway],
})
export class AppModule {}
