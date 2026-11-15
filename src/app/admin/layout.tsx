import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { AdminCatalog } from "@/components/admin-catalog";
import { BulkQuestionUpload } from "@/components/bulk-question-upload";
export const instant=false;

export default async function AdminLayout({children}:{children:React.ReactNode}) {
  await connection();
  const session=await getSession();
  if(!session) redirect("/login?next=/admin");
  if(session.role!=="admin") redirect("/?error=forbidden");
  return <>{children}<div className="page-container admin-catalog-wrap"><BulkQuestionUpload/><AdminCatalog/></div></>;
}
