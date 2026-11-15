CREATE TYPE "user_role" AS ENUM ('student', 'admin');
CREATE TABLE "users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"email" text NOT NULL UNIQUE,"name" text NOT NULL,"password_hash" text NOT NULL,"role" "user_role" NOT NULL DEFAULT 'student',"created_at" timestamptz NOT NULL DEFAULT now());
CREATE TABLE "subjects" ("id" text PRIMARY KEY,"name" text NOT NULL,"description" text NOT NULL DEFAULT '',"color" text NOT NULL DEFAULT '#6d4aff',"display_order" integer NOT NULL DEFAULT 0,"published" boolean NOT NULL DEFAULT false,"created_at" timestamptz NOT NULL DEFAULT now());
CREATE TABLE "units" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"subject_id" text NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,"name" text NOT NULL,"display_order" integer NOT NULL DEFAULT 0,"published" boolean NOT NULL DEFAULT false);
CREATE TABLE "questions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"subject_id" text NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,"unit_id" uuid REFERENCES "units"("id") ON DELETE SET NULL,"prompt" text NOT NULL,"choices" jsonb NOT NULL,"correct_index" integer NOT NULL CHECK (correct_index BETWEEN 0 AND 3),"explanation" text NOT NULL,"source" text NOT NULL DEFAULT '',"difficulty" text NOT NULL DEFAULT '보통',"published" boolean NOT NULL DEFAULT false,"created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,"created_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now());
CREATE TABLE "attempts" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"question_id" uuid NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,"selected_index" integer NOT NULL,"is_correct" boolean NOT NULL,"answered_at" timestamptz NOT NULL DEFAULT now());
CREATE INDEX "attempts_user_answered_idx" ON "attempts" ("user_id","answered_at" DESC);

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "units" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attempts" ENABLE ROW LEVEL SECURITY;

-- API 트랜잭션에서 SET LOCAL app.user_id / app.user_role 설정 후 적용되는 방어 계층입니다.
CREATE POLICY "published subjects are readable" ON "subjects" FOR SELECT USING (published OR current_setting('app.user_role', true) = 'admin');
CREATE POLICY "published units are readable" ON "units" FOR SELECT USING (published OR current_setting('app.user_role', true) = 'admin');
CREATE POLICY "published questions are readable" ON "questions" FOR SELECT USING (published OR current_setting('app.user_role', true) = 'admin');
CREATE POLICY "admins manage subjects" ON "subjects" FOR ALL USING (current_setting('app.user_role', true) = 'admin') WITH CHECK (current_setting('app.user_role', true) = 'admin');
CREATE POLICY "admins manage units" ON "units" FOR ALL USING (current_setting('app.user_role', true) = 'admin') WITH CHECK (current_setting('app.user_role', true) = 'admin');
CREATE POLICY "admins manage questions" ON "questions" FOR ALL USING (current_setting('app.user_role', true) = 'admin') WITH CHECK (current_setting('app.user_role', true) = 'admin');
CREATE POLICY "users read own profile" ON "users" FOR SELECT USING (id::text = current_setting('app.user_id', true) OR current_setting('app.user_role', true) = 'admin');
CREATE POLICY "users read own attempts" ON "attempts" FOR SELECT USING (user_id::text = current_setting('app.user_id', true) OR current_setting('app.user_role', true) = 'admin');
CREATE POLICY "users create own attempts" ON "attempts" FOR INSERT WITH CHECK (user_id::text = current_setting('app.user_id', true));
CREATE POLICY "users update own attempts" ON "attempts" FOR UPDATE USING (user_id::text = current_setting('app.user_id', true)) WITH CHECK (user_id::text = current_setting('app.user_id', true));
CREATE POLICY "users delete own attempts" ON "attempts" FOR DELETE USING (user_id::text = current_setting('app.user_id', true));

INSERT INTO "subjects" ("id","name","description","color","display_order","published") VALUES
('criminal-law','형법','총론부터 각론까지 판례 중심 학습','#6d4aff',1,true),
('criminal-procedure','형사소송법','수사·공판·증거를 흐름으로 정리','#9a7cff',2,true),
('corrections','교정학','교정이론과 현행 법령을 함께','#b565d9',3,true),
('labor-law','노동법','개별·집단적 근로관계 핵심 쟁점','#ee7eb8',4,false);
