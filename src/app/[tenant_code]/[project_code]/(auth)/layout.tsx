import { LogoutConfirm } from "@/components/LogoutConfirm";
import dynamic from "next/dynamic";

const AuthGuardDynamic = dynamic(() => import("@/layouts/auth-guard"), {
  ssr: false,
});

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout(props: AuthLayoutProps) {
  const { children } = props;

  return (
    <>
      <AuthGuardDynamic>{children}</AuthGuardDynamic>
      <LogoutConfirm />
    </>
  );
}
