"use client";

import { Button } from "@/kits/components/Button";
import { Heading } from "@/kits/components/Heading";
import { LoadingOverlay } from "@/kits/components/LoadingOverlay";
import { PasswordInput } from "@/kits/components/PasswordInput";
import { TextInput } from "@/kits/components/TextInput";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "../schemas/login.schema";
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { FormErrorMessage } from "@/components/FormErrorMessage";
import { useNotification } from "@/kits/components/Notification";
import { useMutationAuthLogin } from "@/services/api/auth/login";
import { CommonUtil } from "@/kits/utils";
import { useAuthContext } from "@/contexts/auth.context";
import { useRouter, useParams } from "next/navigation";
import React from "react";
import { useGlobalContext } from "@/contexts/global.context";
import { EUserAccountRole, IStaffProfile, IUserAccount } from "@/types/model";
import { httpRequestGetTenantByCode } from "@/services/application/master-data/tenants";
import { httpRequestGetProjectByCode } from "@/services/application/master-data/tenant-projects";
import { httpRequestLoadAllProjectConfigs } from "@/services/application/management/projects/configs/load-all";
import { getUserFromAccessToken } from "@/utils/auth";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const tenant = authStore.use.tenant();
  const project = authStore.use.project();

  const globalStore = useGlobalContext();
  const selectedAdminDivision = globalStore.use.selectedAdminDivision();
  const selectedLocation = globalStore.use.selectedLocation();
  const projectAuthConfig = globalStore.use.projectAuthConfig();

  const router = useRouter();
  const params = useParams();
  const tenantCode = params?.tenant_code as string;
  const projectCode = params?.project_code as string;
  const notification = useNotification();

  // State to track loading and errors
  const [isLoadingTenant, setIsLoadingTenant] = React.useState(true);
  const [isLoadingProject, setIsLoadingProject] = React.useState(true);
  const [isLoadingConfigs, setIsLoadingConfigs] = React.useState(true);
  const [isTenantNotFound, setIsTenantNotFound] = React.useState(false);
  const [isProjectNotFound, setIsProjectNotFound] = React.useState(false);
  const previousTenantCodeRef = React.useRef<string | undefined>(undefined);
  const previousProjectCodeRef = React.useRef<string | undefined>(undefined);

  // Load tenant and project from URL
  React.useEffect(() => {
    const loadTenantAndProject = async () => {
      if (!tenantCode || !projectCode) {
        setIsLoadingTenant(false);
        setIsLoadingProject(false);
        setIsLoadingConfigs(false);
        return;
      }

      const currentTenantCode = tenantCode;
      const currentProjectCode = projectCode;
      const previousTenantCode = previousTenantCodeRef.current;
      const previousProjectCode = previousProjectCodeRef.current;
      const currentState = authStore.getState();
      const isAuthenticated = currentState.authenticated;
      const currentTenantInState = currentState.tenant;
      const currentProjectInState = currentState.project;

      // Reset state when tenant or project code changes (only if not authenticated)
      if (
        (previousTenantCode && previousTenantCode !== currentTenantCode && !isAuthenticated) ||
        (previousProjectCode && previousProjectCode !== currentProjectCode && !isAuthenticated)
      ) {
        authStore.setState({
          tenant: undefined,
          project: undefined,
        });
        globalStore.setState({
          projectMetadata: undefined,
          projectAuthConfig: undefined,
          projectCheckinFlow: undefined,
          projectGpsConfig: undefined,
          projectAttendancePhotoConfig: undefined,
          projectWorkshiftConfig: undefined,
        });
      }

      // Load tenant
      setIsLoadingTenant(true);
      setIsTenantNotFound(false);
      let tenantLoaded = false;

      try {
        // If tenant with correct code and authenticated, no need to fetch again
        if (isAuthenticated && currentTenantInState?.code === currentTenantCode) {
          previousTenantCodeRef.current = currentTenantCode;
          tenantLoaded = true;
        } else {
          const tenantData = await httpRequestGetTenantByCode(currentTenantCode);
          if (tenantData) {
            authStore.setState({ tenant: tenantData });
            previousTenantCodeRef.current = currentTenantCode;
            tenantLoaded = true;
          } else {
            previousTenantCodeRef.current = undefined;
            setIsTenantNotFound(true);
          }
        }
      } catch (error) {
        console.error("Error loading tenant:", error);
        previousTenantCodeRef.current = undefined;
        setIsTenantNotFound(true);
      } finally {
        setIsLoadingTenant(false);
      }

      // Load project (only after tenant is successfully loaded)
      if (tenantLoaded && !isTenantNotFound) {
        setIsLoadingProject(true);
        setIsProjectNotFound(false);

        try {
          // If project with correct code and authenticated, no need to fetch again
          if (isAuthenticated && currentProjectInState?.code === currentProjectCode) {
            previousProjectCodeRef.current = currentProjectCode;
            setIsLoadingProject(false);
            setIsLoadingConfigs(false);
          } else {
            const projectData = await httpRequestGetProjectByCode(currentProjectCode);
            if (projectData) {
              // Verify project belongs to tenant
              const currentTenant = authStore.getState().tenant;
              if (currentTenant && projectData.tenant_id === currentTenant.id) {
                authStore.setState({ project: projectData });
                previousProjectCodeRef.current = currentProjectCode;
                setIsProjectNotFound(false);

                // Load all project configs
                setIsLoadingConfigs(true);
                try {
                  const allConfigs = await httpRequestLoadAllProjectConfigs(projectData.id);

                  globalStore.setState({
                    projectMetadata: allConfigs.metadata,
                    projectAuthConfig: allConfigs.authConfig,
                    projectCheckinFlow: allConfigs.checkinFlow,
                    projectGpsConfig: allConfigs.gpsConfig,
                    projectAttendancePhotoConfig: allConfigs.attendancePhotoConfig,
                    projectWorkshiftConfig: allConfigs.workshiftConfig,
                  });
                } catch (error) {
                  console.error("Error loading project configs:", error);
                } finally {
                  setIsLoadingConfigs(false);
                }
              } else {
                previousProjectCodeRef.current = undefined;
                setIsProjectNotFound(true);
              }
            } else {
              previousProjectCodeRef.current = undefined;
              setIsProjectNotFound(true);
            }
          }
        } catch (error) {
          console.error("Error loading project:", error);
          previousProjectCodeRef.current = undefined;
          setIsProjectNotFound(true);
        } finally {
          setIsLoadingProject(false);
        }
      } else if (isTenantNotFound) {
        // If tenant not found, don't try to load project
        setIsLoadingProject(false);
        setIsLoadingConfigs(false);
      }
    };

    loadTenantAndProject();

    return () => {
      const currentAuthState = authStore.getState();
      if (!currentAuthState.authenticated) {
        authStore.setState({
          tenant: undefined,
          project: undefined,
        });
        globalStore.setState({
          projectMetadata: undefined,
          projectAuthConfig: undefined,
          projectCheckinFlow: undefined,
          projectGpsConfig: undefined,
          projectAttendancePhotoConfig: undefined,
          projectWorkshiftConfig: undefined,
        });
        previousTenantCodeRef.current = undefined;
        previousProjectCodeRef.current = undefined;
      }
    };
  }, [tenantCode, projectCode, authStore, globalStore]);

  const loginFormMethods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const authLoginMutation = useMutationAuthLogin({
    config: {
      onSuccess(data, variables, context) {
        // Calculate token expiration timestamp
        const expiresAt = Date.now() + data.expiresIn * 1000;

        // Decode access_token to get user info
        const userFromAccessToken = getUserFromAccessToken(data.accessToken);

        if (!userFromAccessToken) {
          notification.error({
            title: "Đăng nhập thất bại!",
            description: "Không thể lấy thông tin người dùng từ token!",
          });
          return;
        }

        // Transform to match AuthStore user format
        // Note: We may need to call backend API to get full profile
        // For now, we'll use basic info from token with default values for required fields
        const now = new Date().toISOString();
        const userId = parseInt(userFromAccessToken.id) || 0;
        const userInfo: IStaffProfile & { account: IUserAccount } = {
          id: userId,
          staffCode: userFromAccessToken.username || "",
          fullName: userFromAccessToken.fullName || userFromAccessToken.username || "",
          profileImage: "",
          trainingDate: now,
          startDate: now,
          passProbationDate: now,
          updatedAt: now,
          account: {
            id: userId,
            username: userFromAccessToken.username || "",
            role: (userFromAccessToken.roles?.[0] as EUserAccountRole) || EUserAccountRole.STAFF,
            createdAt: now,
          },
        };

        notification.success({
          title: "Đăng nhập thành công!",
          description: (
            <>
              Xin chào <span className="font-medium">{userInfo.fullName}</span>
            </>
          ),
          options: {
            duration: 5000,
          },
        });

        authStore.setState({
          authenticated: true,
          token: data.accessToken, // Keep for backward compatibility
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          idToken: data.idToken,
          tokenExpiresAt: expiresAt,
          user: userInfo,
        });

        // Redirect will be handled by the useEffect below
      },
      onError(error, variables, context) {
        console.log(`[🔒] error: `, error);
        authStore.setState({
          authenticated: false,
          user: null,
          token: null,
          accessToken: null,
          refreshToken: null,
          idToken: null,
          tokenExpiresAt: null,
        });

        // Extract error message from Keycloak response
        let errorMessage = "Tên đăng nhập hoặc mật khẩu không chính xác!";
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as any;
          if (axiosError.response?.data) {
            const keycloakError = axiosError.response.data as {
              error_description?: string;
              error?: string;
            };
            if (keycloakError.error_description) {
              errorMessage = keycloakError.error_description;
            } else if (keycloakError.error) {
              errorMessage = keycloakError.error;
            }
          }
        }

        notification.error({
          title: "Đăng nhập thất bại!",
          description: errorMessage,
        });
      },
    },
  });

  const handleFormSubmitOnValid: SubmitHandler<LoginSchema> = (data) => {
    CommonUtil.startAsyncFn(async () => {
      if (!tenant) {
        notification.error({
          title: "Đăng nhập thất bại!",
          description: "Thông tin tenant không tồn tại!",
        });
        return;
      }

      if (!projectAuthConfig) {
        notification.error({
          title: "Đăng nhập thất bại!",
          description: "Cấu hình xác thực dự án không hợp lệ!",
        });
        return;
      }

      await authLoginMutation.mutateAsync({
        username: data.username,
        password: data.password,
        tenantCode: tenant.code,
        keycloakBaseUrl: tenant.keycloak_base_url,
        keycloakRealm: tenant.keycloak_realm,
        keycloakClientId: projectAuthConfig.keycloak_client_id,
        keycloakClientSecret: projectAuthConfig.keycloak_client_secret,
      });
    });
  };

  const handleFormSubmitOnInvalid: SubmitErrorHandler<LoginSchema> = (errors) => {
    console.log(errors);
  };

  React.useEffect(() => {
    if (user) {
      if (user?.account?.role === EUserAccountRole.SALE) {
        router.replace(`/${tenantCode}/${projectCode}/sale/lobby`);
      } else if (!selectedAdminDivision || !selectedLocation) {
        router.replace(`/${tenantCode}/${projectCode}/outlet`);
      } else {
        router.replace(`/${tenantCode}/${projectCode}/lobby`);
      }
    }
  }, [user, tenantCode, projectCode, router, selectedAdminDivision, selectedLocation]);

  // Show loading while fetching tenant/project
  if (isLoadingTenant || isLoadingProject || isLoadingConfigs) {
    return (
      <>
        <LoadingOverlay active={true} />
        <div className="flex min-h-screen mt-12 justify-center">
          <div className="text-center">
            <p className="text-gray-600">Đang tải thông tin dự án...</p>
          </div>
        </div>
      </>
    );
  }

  // Show 404 if tenant or project not found
  if (isTenantNotFound || isProjectNotFound) {
    return (
      <div className="flex min-h-screen mt-12 justify-center">
        <div className="text-center">
          <h1 className="text-3xl text-gray-800 mb-4">404</h1>
          <p className="text-gray-600">
            {isTenantNotFound
              ? "Tenant không tồn tại hoặc không hoạt động"
              : "Project không tồn tại hoặc không hoạt động"}
          </p>
        </div>
      </div>
    );
  }

  // Get logo URL - prioritize project logo, fallback to tenant logo, then default
  const logoUrl =
    project?.logo_url || tenant?.logo_url || "/images/nextsystem-logo.webp";

  return (
    <>
      <LoadingOverlay active={authLoginMutation.isLoading} />

      <div className="px-4 py-16">
        {/* Tile */}
        <form
          className={"w-full bg-white px-4 py-12"}
          onSubmit={loginFormMethods.handleSubmit(
            handleFormSubmitOnValid,
            handleFormSubmitOnInvalid,
          )}
        >
          {/* Logo */}
          <div className={"mb-12 flex items-center justify-center"}>
            <Image
              src={logoUrl}
              alt={project?.name || tenant?.name || "Logo"}
              width={360}
              height={108}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Heading */}
          <Heading as="h1" level="h3">
            Đăng nhập hệ thống báo cáo
          </Heading>
          <Heading as="h3" level="h5" className="mb-8">
            {tenant?.name} - {project?.name}
          </Heading>
          {/* Fields */}
          <div className={"space-y-4"}>
            <div>
              <Controller
                control={loginFormMethods.control}
                name="username"
                render={({ field }) => (
                  <TextInput
                    label="Tên đăng nhập"
                    placeholder="Nhập tên đăng nhập"
                    autoCapitalize="none"
                    error={!!loginFormMethods.formState.errors.username}
                    {...field}
                  />
                )}
              />
              <FormErrorMessage name="username" errors={loginFormMethods.formState.errors} />
            </div>
            <div>
              <Controller
                control={loginFormMethods.control}
                name="password"
                render={({ field }) => (
                  <PasswordInput
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu"
                    autoCapitalize="none"
                    error={!!loginFormMethods.formState.errors.password}
                    {...field}
                  />
                )}
              />
              <FormErrorMessage name="password" errors={loginFormMethods.formState.errors} />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={authLoginMutation.isLoading}
            variant="primary"
            className={"mt-8 w-[200px]"}
          >
            Đăng nhập
          </Button>
        </form>
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Powered by Nexts</p>
          <p>Copyright © {new Date().getFullYear()} FMS. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};
