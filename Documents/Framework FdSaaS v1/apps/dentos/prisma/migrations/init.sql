-- DentOS — Initial Schema
-- Ejecutar en Supabase SQL Editor

-- Enums
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'RECORDATORIO_1', 'RECORDATORIO_2', 'CONFIRMADA', 'CANCELADA', 'NO_SHOW');
CREATE TYPE "Plan" AS ENUM ('TRIAL', 'STARTER', 'PRO');

-- Clinica (organization root, multi-tenant)
CREATE TABLE "Clinica" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "whatsappNumero" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'STARTER',
    "planActivoHasta" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clinica_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Clinica_userId_key" ON "Clinica"("userId");
CREATE INDEX "Clinica_userId_idx" ON "Clinica"("userId");

-- Dentista
CREATE TABLE "Dentista" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dentista_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Dentista_clinicaId_idx" ON "Dentista"("clinicaId");

-- Paciente
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "clinicaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Paciente_clinicaId_idx" ON "Paciente"("clinicaId");

-- Cita
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "wa1SentAt" TIMESTAMP(3),
    "wa2SentAt" TIMESTAMP(3),
    "clinicaId" TEXT NOT NULL,
    "dentistaId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Cita_clinicaId_idx" ON "Cita"("clinicaId");
CREATE INDEX "Cita_clinicaId_fecha_idx" ON "Cita"("clinicaId", "fecha");

-- Foreign Keys
ALTER TABLE "Dentista" ADD CONSTRAINT "Dentista_clinicaId_fkey"
    FOREIGN KEY ("clinicaId") REFERENCES "Clinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_clinicaId_fkey"
    FOREIGN KEY ("clinicaId") REFERENCES "Clinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Cita" ADD CONSTRAINT "Cita_clinicaId_fkey"
    FOREIGN KEY ("clinicaId") REFERENCES "Clinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Cita" ADD CONSTRAINT "Cita_dentistaId_fkey"
    FOREIGN KEY ("dentistaId") REFERENCES "Dentista"("id") ON UPDATE CASCADE;

ALTER TABLE "Cita" ADD CONSTRAINT "Cita_pacienteId_fkey"
    FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON UPDATE CASCADE;
