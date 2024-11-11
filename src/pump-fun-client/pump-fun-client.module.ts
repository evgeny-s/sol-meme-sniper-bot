import { Module } from '@nestjs/common';
import { PumpFunClientService } from './pump-fun-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [PumpFunClientService],
  imports: [
    HttpModule.register({
      timeout: 20000,
    }),
  ],
  exports: [PumpFunClientService],
})
export class PumpFunClientModule {}
