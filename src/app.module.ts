import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SociosModule } from './socios/socios.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule, // Importa PrismaModule aquí
    SociosModule, AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
