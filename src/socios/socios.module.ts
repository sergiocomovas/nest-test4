import { Module } from '@nestjs/common';
import { SociosService } from './socios.service';
import { SociosController } from './socios.controller';

@Module({
  providers: [SociosService],
  controllers: [SociosController],
})
export class SociosModule {}
