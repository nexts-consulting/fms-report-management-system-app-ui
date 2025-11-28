import { redirect } from "next/navigation";

interface RootPageProps {
  params: {
    tenant_code: string;
    project_code: string;
  };
}

export default function RootPage({ params }: RootPageProps) {
  const { tenant_code, project_code } = params;
  return redirect(`/${tenant_code}/${project_code}/lobby`);
}
