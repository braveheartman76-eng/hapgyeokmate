ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_correct_index_check";
ALTER TABLE "questions" ADD CONSTRAINT "questions_correct_index_check" CHECK ("correct_index" BETWEEN 0 AND 4);
