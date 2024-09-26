import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { locales } from "./resources";
const logger = new Logger("Main");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.URL_BASE,
    credentials: true,
  });
  await app.listen(locales.port);
  logger.log(`gateways está executando na url ${await app.getUrl()}`);
}
bootstrap();
