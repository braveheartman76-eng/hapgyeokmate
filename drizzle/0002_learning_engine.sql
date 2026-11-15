CREATE TYPE "exam_status" AS ENUM ('in_progress', 'submitted');
CREATE TYPE "review_status" AS ENUM ('pending', 'completed');

CREATE TABLE "question_versions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,"version" integer NOT NULL,"prompt" text NOT NULL,"choices" jsonb NOT NULL,"correct_index" integer NOT NULL,"explanation" text NOT NULL,"source" text NOT NULL DEFAULT '',"difficulty" text NOT NULL DEFAULT '보통',"created_at" timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX "question_versions_question_version_idx" ON "question_versions" ("question_id","version");

INSERT INTO "question_versions" ("question_id","version","prompt","choices","correct_index","explanation","source","difficulty")
SELECT "id",1,"prompt","choices","correct_index","explanation","source","difficulty" FROM "questions";

CREATE OR REPLACE FUNCTION create_question_version() RETURNS trigger AS $$
BEGIN
  INSERT INTO "question_versions" ("question_id","version","prompt","choices","correct_index","explanation","source","difficulty")
  VALUES (NEW."id", COALESCE((SELECT MAX("version") + 1 FROM "question_versions" WHERE "question_id" = NEW."id"),1), NEW."prompt",NEW."choices",NEW."correct_index",NEW."explanation",NEW."source",NEW."difficulty");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER questions_create_version AFTER INSERT OR UPDATE OF "prompt","choices","correct_index","explanation","source","difficulty" ON "questions" FOR EACH ROW EXECUTE FUNCTION create_question_version();

CREATE TABLE "exam_sessions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"subject_id" text NOT NULL REFERENCES "subjects"("id") ON DELETE RESTRICT,"status" "exam_status" NOT NULL DEFAULT 'in_progress',"total_questions" integer NOT NULL,"current_index" integer NOT NULL DEFAULT 0,"score" integer,"started_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now(),"submitted_at" timestamptz);
CREATE TABLE "session_questions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"session_id" uuid NOT NULL REFERENCES "exam_sessions"("id") ON DELETE CASCADE,"question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE RESTRICT,"question_version_id" uuid NOT NULL REFERENCES "question_versions"("id") ON DELETE RESTRICT,"position" integer NOT NULL);
CREATE UNIQUE INDEX "session_questions_position_idx" ON "session_questions" ("session_id","position");
CREATE UNIQUE INDEX "session_questions_question_idx" ON "session_questions" ("session_id","question_id");
CREATE TABLE "session_answers" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"session_id" uuid NOT NULL REFERENCES "exam_sessions"("id") ON DELETE CASCADE,"session_question_id" uuid NOT NULL REFERENCES "session_questions"("id") ON DELETE CASCADE,"selected_index" integer,"is_correct" boolean,"updated_at" timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX "session_answers_question_idx" ON "session_answers" ("session_question_id");
CREATE TABLE "review_items" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,"status" "review_status" NOT NULL DEFAULT 'pending',"last_wrong_at" timestamptz NOT NULL DEFAULT now(),"completed_at" timestamptz);
CREATE UNIQUE INDEX "review_items_user_question_idx" ON "review_items" ("user_id","question_id");
CREATE TABLE "bookmarks" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,"created_at" timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX "bookmarks_user_question_idx" ON "bookmarks" ("user_id","question_id");

ALTER TABLE "question_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "review_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookmarks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published question versions are readable" ON "question_versions" FOR SELECT USING (EXISTS (SELECT 1 FROM "questions" q WHERE q."id" = "question_id" AND q."published"));
CREATE POLICY "users manage own exam sessions" ON "exam_sessions" FOR ALL USING ("user_id"::text = current_setting('app.user_id', true)) WITH CHECK ("user_id"::text = current_setting('app.user_id', true));
CREATE POLICY "users read own session questions" ON "session_questions" FOR SELECT USING (EXISTS (SELECT 1 FROM "exam_sessions" s WHERE s."id" = "session_id" AND s."user_id"::text = current_setting('app.user_id', true)));
CREATE POLICY "users manage own session answers" ON "session_answers" FOR ALL USING (EXISTS (SELECT 1 FROM "exam_sessions" s WHERE s."id" = "session_id" AND s."user_id"::text = current_setting('app.user_id', true))) WITH CHECK (EXISTS (SELECT 1 FROM "exam_sessions" s WHERE s."id" = "session_id" AND s."user_id"::text = current_setting('app.user_id', true)));
CREATE POLICY "users manage own review items" ON "review_items" FOR ALL USING ("user_id"::text = current_setting('app.user_id', true)) WITH CHECK ("user_id"::text = current_setting('app.user_id', true));
CREATE POLICY "users manage own bookmarks" ON "bookmarks" FOR ALL USING ("user_id"::text = current_setting('app.user_id', true)) WITH CHECK ("user_id"::text = current_setting('app.user_id', true));
