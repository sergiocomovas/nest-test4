/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SociosService } from './socios.service';
import { Prisma } from '@prisma/client';

@Controller('socios')
export class SociosController {
  constructor(private readonly sociosService: SociosService) {}

  @Get()
  findAll() {
    return this.sociosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sociosService.findOne(+id);
  }

  @Post()
  create(@Body() data: Prisma.SocioCreateInput) {
    return this.sociosService.create(data);
  }
}
