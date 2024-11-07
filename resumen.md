# Proyecto NestJS con Prisma y SQLite

Este documento resume cómo configurar un proyecto de **NestJS** con **Prisma** como ORM y **SQLite** como base de datos para manejar un sistema de gestión de socios y eventos.

## 1. Configuración del Proyecto

### Crear el Proyecto de NestJS

Primero, crea un nuevo proyecto de NestJS y navega a su directorio:

```bash
nest new socios-eventos-app
cd socios-eventos-app
```

Selecciona **npm** o **yarn** como el gestor de paquetes.

### Instalar Prisma y SQLite

Instala Prisma y SQLite como dependencias del proyecto:

```bash
yarn add @prisma/client
yarn add -D prisma
```

Inicia Prisma para crear la configuración de esquema:

```bash
npx prisma init
```

## 2. Configuración de SQLite en Prisma

Abre `prisma/schema.prisma` y configura SQLite como proveedor de base de datos:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}
```

## 3. Definir el Esquema de Prisma

Define las tablas en `schema.prisma` basándote en la siguiente estructura:

```prisma
model Socio {
  id                       Int      @id @default(autoincrement())
  nombre                   String
  email                    String   @unique
  telefono                 String?  @unique
  direccion                String?
  contacto_adicional_nombre String?
  contacto_adicional_telefono String?
  creado_en                DateTime @default(now())
  
  reservas   Reserva[]
  tokens     Token[]
  amigos     Amigo[] @relation("SocioAmigos")
  grupos     UsuarioGrupo[]
}

model Evento {
  id          Int      @id @default(autoincrement())
  nombre      String
  descripcion String?
  fecha       DateTime
  ubicacion   String?
  url_externa String?
  creado_en   DateTime @default(now())

  reservas    Reserva[]
}

model Reserva {
  id           Int      @id @default(autoincrement())
  socio_id     Int
  evento_id    Int
  reservado_en DateTime @default(now())
  
  socio        Socio   @relation(fields: [socio_id], references: [id])
  evento       Evento  @relation(fields: [evento_id], references: [id])
  pago         Pago?

  @@unique([socio_id, evento_id])
}

model Pago {
  id         Int      @id @default(autoincrement())
  reserva_id Int      @unique
  cantidad   Float
  estado     String   @default("no pagado")
  pagado_en  DateTime?
  creado_en  DateTime @default(now())
  
  reserva    Reserva   @relation(fields: [reserva_id], references: [id])
}

model Token {
  id         Int      @id @default(autoincrement())
  socio_id   Int
  token      String
  expira_en  DateTime
  creado_en  DateTime @default(now())
  
  socio      Socio    @relation(fields: [socio_id], references: [id])
}

model Amigo {
  id           Int      @id @default(autoincrement())
  socio_id     Int
  socio_amigo_id Int
  creado_en    DateTime @default(now())

  socio        Socio   @relation("SocioAmigos", fields: [socio_id], references: [id])
  socioAmigo   Socio   @relation("SocioAmigosInverse", fields: [socio_amigo_id], references: [id])

  @@unique([socio_id, socio_amigo_id])
}

model Grupo {
  id          Int      @id @default(autoincrement())
  nombre      String
  descripcion String?
  creado_en   DateTime @default(now())

  usuarios UsuarioGrupo[]
}

model UsuarioGrupo {
  id         Int      @id @default(autoincrement())
  socio_id   Int
  grupo_id   Int
  unido_en   DateTime @default(now())
  
  socio      Socio    @relation(fields: [socio_id], references: [id])
  grupo      Grupo    @relation(fields: [grupo_id], references: [id])

  @@unique([socio_id, grupo_id])
}
```

## 4. Aplicar Migraciones y Generar el Cliente de Prisma

Ejecuta estos comandos para aplicar las migraciones y generar el cliente de Prisma:

```bash
yarn prisma migrate dev --name init
yarn prisma generate
```

Esto creará las tablas en la base de datos `dev.db` y generará el cliente de Prisma para interactuar con la base de datos.

## 5. Configurar el Servicio Prisma en NestJS

Crea `PrismaModule` y `PrismaService` para gestionar la conexión con la base de datos:

**prisma.module.ts**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**prisma.service.ts**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Importa `PrismaModule` en `AppModule` para que esté disponible en toda la aplicación:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SociosModule } from './socios/socios.module';

@Module({
  imports: [PrismaModule, SociosModule],
})
export class AppModule {}
```

## 6. Crear Módulos, Servicios y Controladores en NestJS

Genera un módulo, servicio y controlador para **Socios**:

```bash
nest generate module socios
nest generate service socios
nest generate controller socios
```

### Ejemplo de `SociosService`

Define métodos CRUD en `socios.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SociosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.socio.findMany();
  }

  async findOne(id: number) {
    return this.prisma.socio.findUnique({ where: { id } });
  }

  async create(data: { nombre: string; email: string; telefono?: string; direccion?: string }) {
    return this.prisma.socio.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.socio.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.socio.delete({ where: { id } });
  }
}
```

### Ejemplo de `SociosController`

Define rutas en `socios.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SociosService } from './socios.service';

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
  create(@Body() data: any) {
    return this.sociosService.create(data);
  }
}
```

## 7. Ejemplo de Solicitud para Crear un Socio en Insomnia

En Insomnia, crea una solicitud **POST** para `http://localhost:3000/socios` con el siguiente cuerpo en formato JSON:

```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@example.com",
  "telefono": "1234567890",
  "direccion": "Calle Falsa 123",
  "contacto_adicional_nombre": "Ana Pérez",
  "contacto_adicional_telefono": "0987654321",
  "creado_en": "2024-11-06T00:00:00.000Z"
}
```

Este ejemplo muestra cómo configurar y utilizar un proyecto NestJS con Prisma y SQLite para gestionar una base de datos relacional con múltiples tablas relacionadas.
