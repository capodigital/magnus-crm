-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "company" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "lifecycle" TEXT NOT NULL DEFAULT 'PROSPECT',
ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "expectedCloseAt" TIMESTAMP(3),
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'OPPORTUNITY',
ADD COLUMN     "valueCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "pipeline_stages" ADD COLUMN     "outcome" "LeadStatus" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occursAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "segment" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_automations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "stageId" TEXT,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_deliveries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "campaignId" TEXT,
    "automationId" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "unsubscribeToken" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "publicBaseUrl" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "lockedAt" TIMESTAMP(3),
    "firstAttemptAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "providerId" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_tenantId_contactId_occursAt_idx" ON "activities"("tenantId", "contactId", "occursAt");

-- CreateIndex
CREATE INDEX "activities_tenantId_completedAt_occursAt_idx" ON "activities"("tenantId", "completedAt", "occursAt");

-- CreateIndex
CREATE INDEX "proposals_tenantId_contactId_createdAt_idx" ON "proposals"("tenantId", "contactId", "createdAt");

-- CreateIndex
CREATE INDEX "email_campaigns_tenantId_status_scheduledAt_idx" ON "email_campaigns"("tenantId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "email_automations_tenantId_active_trigger_idx" ON "email_automations"("tenantId", "active", "trigger");

-- CreateIndex
CREATE UNIQUE INDEX "email_deliveries_dedupeKey_key" ON "email_deliveries"("dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "email_deliveries_unsubscribeToken_key" ON "email_deliveries"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "email_deliveries_tenantId_status_dueAt_idx" ON "email_deliveries"("tenantId", "status", "dueAt");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_automations" ADD CONSTRAINT "email_automations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "email_automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve the meaning of the built-in closing stages and existing won customers.
UPDATE "pipeline_stages" SET "outcome" = 'WON' WHERE "slug" = 'ganado' AND "isFinal" = true;
UPDATE "pipeline_stages" SET "outcome" = 'LOST' WHERE "slug" = 'perdido' AND "isFinal" = true;
UPDATE "contacts" AS c SET "lifecycle" = 'CUSTOMER'
WHERE EXISTS (SELECT 1 FROM "leads" AS l WHERE l."contactId" = c."id" AND l."tenantId" = c."tenantId" AND l."status" = 'WON');
