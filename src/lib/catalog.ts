import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { questionsTable, subjectsTable, units } from "@/db/schema";
import { subjects as fallbackSubjects } from "@/lib/data";

export type CatalogUnit = { id:string; name:string; questionCount:number };
export type CatalogSubject = { id:string; name:string; description:string; color:string; units:CatalogUnit[] };

export async function getPublishedCatalog():Promise<CatalogSubject[]> {
  if (!process.env.DATABASE_URL) return fallbackSubjects.filter((item) => item.available).map((item) => ({...item, units:item.units.map((name,index) => ({id:`fallback-${index}`,name,questionCount:0}))}));
  const rows = await getDb().select({ subjectId:subjectsTable.id, name:subjectsTable.name, description:subjectsTable.description, color:subjectsTable.color, unitId:units.id, unitName:units.name, questionCount:sql<number>`count(${questionsTable.id})` }).from(subjectsTable).leftJoin(units, and(eq(units.subjectId,subjectsTable.id),eq(units.published,true))).leftJoin(questionsTable,and(eq(questionsTable.unitId,units.id),eq(questionsTable.published,true))).where(eq(subjectsTable.published,true)).groupBy(subjectsTable.id,units.id).orderBy(asc(subjectsTable.displayOrder),asc(units.displayOrder));
  const catalog = new Map<string,CatalogSubject>();
  for (const row of rows) {
    const subject = catalog.get(row.subjectId) ?? { id:row.subjectId, name:row.name, description:row.description, color:row.color, units:[] };
    if (row.unitId && row.unitName) subject.units.push({ id:row.unitId, name:row.unitName, questionCount:Number(row.questionCount) });
    catalog.set(row.subjectId,subject);
  }
  return [...catalog.values()];
}

export async function getPublishedSubject(id:string) {
  return (await getPublishedCatalog()).find((subject) => subject.id === id);
}
