import { LogoutConfirm } from "@/components/LogoutConfirm";
import { AuthGuardWrapper } from "@/layouts/auth-guard-wrapper";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout(props: AuthLayoutProps) {
  const { children } = props;

  return (
    <>
      <AuthGuardWrapper>{children}</AuthGuardWrapper>
      <LogoutConfirm />
    </>
  );
}
