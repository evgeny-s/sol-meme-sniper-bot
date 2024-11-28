import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  initSentry();

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}

const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],

    tracesSampleRate: 1.0,

    profilesSampleRate: 1.0,
  });
};

bootstrap();
