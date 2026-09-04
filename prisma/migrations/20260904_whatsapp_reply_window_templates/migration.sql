-- Incremental migration for the existing Magnus CRM schema.
-- The project previously used Prisma db push, so this migration only contains
-- the new WhatsApp reply-window and template structures.

CREATE TYPE "WhatsappTemplateCategory" AS ENUM ('UTILITY', 'MARKETING', 'AUTHENTICATION');

CREATE TYPE "WhatsappTemplateStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED');

ALTER TABLE "conversations" ADD COLUMN "lastInboundAt" TIMESTAMP(3);

ALTER TABLE "messages" ADD COLUMN "whatsappTemplateId" TEXT;

UPDATE "conversations" AS conversation
SET "lastInboundAt" = latest."lastInboundAt"
FROM (
    SELECT "conversationId", MAX("createdAt") AS "lastInboundAt"
    FROM "messages"
    WHERE "direction" = 'INBOUND'
    GROUP BY "conversationId"
) AS latest
WHERE conversation."id" = latest."conversationId"
  AND conversation."lastInboundAt" IS NULL;

CREATE TABLE "whatsapp_message_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "category" "WhatsappTemplateCategory" NOT NULL,
    "status" "WhatsappTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "metaTemplateId" TEXT,
    "bodyText" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_message_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whatsapp_message_templates_tenantId_name_language_key"
ON "whatsapp_message_templates"("tenantId", "name", "language");

CREATE UNIQUE INDEX "whatsapp_message_templates_tenantId_metaTemplateId_key"
ON "whatsapp_message_templates"("tenantId", "metaTemplateId");

CREATE INDEX "whatsapp_message_templates_tenantId_status_updatedAt_idx"
ON "whatsapp_message_templates"("tenantId", "status", "updatedAt");

CREATE INDEX "conversations_tenantId_channel_lastInboundAt_idx"
ON "conversations"("tenantId", "channel", "lastInboundAt");

ALTER TABLE "whatsapp_message_templates"
ADD CONSTRAINT "whatsapp_message_templates_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages"
ADD CONSTRAINT "messages_whatsappTemplateId_fkey"
FOREIGN KEY ("whatsappTemplateId") REFERENCES "whatsapp_message_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
