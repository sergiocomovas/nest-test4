// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Método para enviar el magic link por email
  async sendMagicLink(email) {
    // 1. Obtener los datos completos del socio
    const socio = await this.prisma.socio.findUnique({ where: { email } });
    if (!socio) throw new Error('Usuario no encontrado');

    // 2. Configurar el payload con todos los datos del socio
    const payload = {
      ...socio, // Incluye todos los campos del socio en el payload
    };

    // Configurar el tiempo de expiración en 3 meses (90 días en segundos)
    const expirationTimeInSeconds = 90 * 24 * 60 * 60; // 90 días * 24 horas * 60 minutos * 60 segundos

    // Generar el JWT con tiempo de expiración de 3 meses
    const token = this.jwtService.sign(payload, {
      expiresIn: expirationTimeInSeconds,
    });

    // Calcular la fecha de expiración en 3 meses para guardar en la base de datos
    const expiration = new Date(Date.now() + expirationTimeInSeconds * 1000);

    // 3. Guardar el JWT en la base de datos con la fecha de expiración
    await this.prisma.token.create({
      data: {
        token,
        socio_id: socio.id,
        expira_en: expiration, // Guardar la fecha de expiración en formato Date
      },
    });

    // 4. Configurar el transporter de Nodemailer para enviar el correo
    const transporter = nodemailer.createTransport({
      host: 'mail.comovas.es', // Servidor de correo saliente
      port: 465, // Puerto SMTP seguro (SSL/TLS)
      secure: true, // true para usar SSL/TLS
      auth: {
        user: 'test@comovas.es', // Nombre de usuario
        pass: '++Test++1234', // Contraseña
      },
      tls: {
        rejectUnauthorized: false, // Ignora la verificación del certificado
      },
    });

    // 5. Crear el enlace mágico con el JWT
    const magicLink = `http://localhost:3000/auth/verify?token=${token}`;

    // 6. Enviar el email con el enlace mágico
    await transporter.sendMail({
      from: '"Tu App" <test@comovas.es>', // Dirección de envío
      to: email, // Dirección del destinatario
      subject: 'Tu enlace mágico para iniciar sesión',
      text: `Haz clic en el siguiente enlace para iniciar sesión: ${magicLink}`,
      html: `<a href="${magicLink}">Haz clic aquí para iniciar sesión</a>`,
    });

    return { message: `Enlace mágico enviado al correo ${email}` };
  }

  // Método para verificar el token del magic link y generar el JWT
  async verifyMagicLink(token: string) {
    // 1. Decodificar el JWT para obtener el payload
    let payload: any;
    try {
      payload = this.jwtService.verify(token); // Decodificar el JWT para obtener el payload
    } catch (err) {
      throw new Error('Token inválido o mal formado');
    }

    // 2. Verificar si el token existe en la base de datos y no ha expirado
    const tokenRecord = await this.prisma.token.findUnique({
      where: { token },
      include: { socio: true },
    });

    if (!tokenRecord || tokenRecord.expira_en < new Date()) {
      throw new Error('Token inválido o expirado');
    }

    // 3. Comprobar que el `socio_id` en el payload coincide con `tokenRecord.socio.id`
    if (payload.id !== tokenRecord.socio.id) {
      throw new Error(
        'El ID del socio en el token no coincide con el registro',
      );
    }

    // 4. Opcional: Eliminar el token después de su uso
    // await this.prisma.token.delete({ where: { token } });

    // 5. Eliminar todos los tokens caducados
    await this.prisma.token.deleteMany({
      where: {
        expira_en: { lt: new Date() },
      },
    });

    // 6. Retornar el payload completo y fecha expiracion si todo está bien
    return { ...payload, expira_en: tokenRecord.expira_en };
  }
}
