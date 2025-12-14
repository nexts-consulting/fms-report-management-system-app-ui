import { redirect } from "next/navigation";

interface RootPageProps {
  params: Promise<{
    tenant_code: string;
    project_code: string;
  }>;
}

export default async function RootPage({ params }: RootPageProps) {
  const { tenant_code, project_code } = await params;
  return redirect(`/${tenant_code}/${project_code}/lobby`);
}
