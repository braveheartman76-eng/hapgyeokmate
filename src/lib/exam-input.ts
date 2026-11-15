import { z } from "zod";
export const createExamInput=z.object({subjectId:z.string().min(1),count:z.number().int().min(1).max(50).default(20)});
export const saveAnswerInput=z.object({sessionQuestionId:z.string().uuid(),selectedIndex:z.number().int().min(0).max(9).nullable(),currentIndex:z.number().int().min(0)});
