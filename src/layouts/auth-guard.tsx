"use client";

import { redirect } from "next/navigation";
import React from "react";
import { useAuthContext } from "@/contexts/auth.context";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { useTenantProjectPath } from "@/hooks/use-tenant-project-path";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = (props: AuthGuardProps) => {
  const { children } = props;

  const authContext = useAuthContext();
  const authenticated = authContext.use.authenticated();
  const user = authContext.use.user();
  const {buildPath} = useTenantProjectPath();
  React.useEffect(() => {
    if (authenticated === undefined) return;

    if (authenticated && user) {
      console.log(`[🔒] Authenticated: `, user.account.username);
    }
  }, [authenticated]);

  React.useEffect(() => {
    setTimeout(() => {
      if (authenticated === undefined && !user) {
        authContext.setState({
          authenticated: false,
          user: null,
        });
      }
    }, 1000);
  }, [authenticated]);

  if (authenticated === undefined) {
    return (
      <>
        <LoadingOverlay active={true} />
      </>
    );
  }

  if (!authenticated) {
    redirect(buildPath("/login"));
  }

  return authenticated && children;
};

export default AuthGuard;
