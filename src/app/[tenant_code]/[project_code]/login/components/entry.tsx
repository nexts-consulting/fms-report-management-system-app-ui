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

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();
  const tenant = authStore.use.tenant();
  const project = authStore.use.project();

  const globalStore = useGlobalContext();
  const selectedProvince = globalStore.use.selectedProvince();
  const selectedOutlet = globalStore.use.selectedOutlet();

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
        if (!data.profile) {
          notification.error({
            title: "Đăng nhập thất bại!",
            description: "Profile không tồn tại!",
          });
          return;
        }

        notification.success({
          title: "Đăng nhập thành công!",
          description: (
            <>
              Xin chào <span className="font-medium">{data.profile.fullName}</span>
            </>
          ),
          options: {
            duration: 5000,
          },
        });

        authStore.setState({
          authenticated: true,
          token: data.token,
          user: data.profile as IStaffProfile & { account: IUserAccount },
        });

        // Redirect will be handled by the useEffect below
      },
      onError(error, variables, context) {
        console.log(error);
        notification.error({
          title: "Đăng nhập thất bại!",
          description: "Tên đăng nhập hoặc mật khẩu không chính xác!",
        });
      },
    },
  });

  const handleFormSubmitOnValid: SubmitHandler<LoginSchema> = (data) => {
    CommonUtil.startAsyncFn(async () => {
      await authLoginMutation.mutateAsync(data);
    });
  };

  const handleFormSubmitOnInvalid: SubmitErrorHandler<LoginSchema> = (errors) => {
    console.log(errors);
  };

  React.useEffect(() => {
    if (user) {
      if (user?.account?.role === EUserAccountRole.SALE) {
        router.replace(`/${tenantCode}/${projectCode}/sale/lobby`);
      } else if (!selectedProvince || !selectedOutlet) {
        router.replace(`/${tenantCode}/${projectCode}/outlet`);
      } else {
        router.replace(`/${tenantCode}/${projectCode}/lobby`);
      }
    }
  }, [user, tenantCode, projectCode, router, selectedProvince, selectedOutlet]);

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
          <Heading as="h1" level="h3" className="mb-8">
            Đăng nhập hệ thống báo cáo
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
      </div>
    </>
  );
};
