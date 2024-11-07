/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SociosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const socios = await this.prisma.socio.findMany({
      select: {
        nombre: true,
        email: true,
        telefono:true,
      },
    });

    // Transformar el resultado para mostrar solo los primeros tres caracteres del email
    return socios.map((socio) => ({
      nombre: socio.nombre.split(' ')[0] + ' ...' + socio.nombre.slice(-2),
      email: socio.email.slice(0, 4)+'...', 
      telefono: socio.telefono.slice(0, 4)+'...', 
    }));
  }

  async findOne(id: number) {
    return this.prisma.socio.findUnique({ where: { id } });
  }

  async create(data: Prisma.SocioCreateInput) {
    return this.prisma.socio.create({ data });
  }

  async update(id: number, data: Prisma.SocioUpdateInput) {
    return this.prisma.socio.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.socio.delete({ where: { id } });
  }
}
