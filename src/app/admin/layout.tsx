import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
export const instant=false;

export default async function AdminLayout({children}:{children:React.ReactNode}) {
  const session=await getSession();
  if(!session) redirect("/login?next=/admin");
  if(session.role!=="admin") redirect("/?error=forbidden");
  return children;
}
