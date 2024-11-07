// src/auth/auth.controller.ts
import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Endpoint para verificar el token del magic link y generar el JWT
  @Get('verify')
  async verifyMagicLink(@Query('token') token: string) {
    return this.authService.verifyMagicLink(token);
  }

  // Endpoint para enviar el magic link al email del usuario
  @Post('magic-link')
  async sendMagicLink(@Body('email') email: string) {
    return this.authService.sendMagicLink(email);
  }
}
