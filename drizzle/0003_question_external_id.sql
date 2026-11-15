ALTER TABLE "questions" ADD COLUMN "external_id" text;
CREATE UNIQUE INDEX "questions_external_id_idx" ON "questions" ("external_id") WHERE "external_id" IS NOT NULL;
