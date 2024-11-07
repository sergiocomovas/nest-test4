// prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Hace que este módulo sea global
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
