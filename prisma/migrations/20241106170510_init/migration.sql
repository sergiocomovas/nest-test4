-- CreateTable
CREATE TABLE "Socio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "contacto_adicional_nombre" TEXT,
    "contacto_adicional_telefono" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" DATETIME NOT NULL,
    "ubicacion" TEXT,
    "url_externa" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socio_id" INTEGER NOT NULL,
    "evento_id" INTEGER NOT NULL,
    "reservado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reserva_socio_id_fkey" FOREIGN KEY ("socio_id") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "Evento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reserva_id" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'no pagado',
    "pagado_en" DATETIME,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pago_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "Reserva" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socio_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expira_en" DATETIME NOT NULL,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Token_socio_id_fkey" FOREIGN KEY ("socio_id") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Amigo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socio_id" INTEGER NOT NULL,
    "socio_amigo_id" INTEGER NOT NULL,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Amigo_socio_id_fkey" FOREIGN KEY ("socio_id") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Amigo_socio_amigo_id_fkey" FOREIGN KEY ("socio_amigo_id") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UsuarioGrupo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socio_id" INTEGER NOT NULL,
    "grupo_id" INTEGER NOT NULL,
    "unido_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsuarioGrupo_socio_id_fkey" FOREIGN KEY ("socio_id") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsuarioGrupo_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "Grupo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Socio_email_key" ON "Socio"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Socio_telefono_key" ON "Socio"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_socio_id_evento_id_key" ON "Reserva"("socio_id", "evento_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_reserva_id_key" ON "Pago"("reserva_id");

-- CreateIndex
CREATE UNIQUE INDEX "Amigo_socio_id_socio_amigo_id_key" ON "Amigo"("socio_id", "socio_amigo_id");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioGrupo_socio_id_grupo_id_key" ON "UsuarioGrupo"("socio_id", "grupo_id");
