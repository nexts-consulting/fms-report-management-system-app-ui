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
import { useRouter } from "next/navigation";
import React from "react";
import { useGlobalContext } from "@/contexts/global.context";
import { EUserAccountRole, IStaffProfile, IUserAccount } from "@/types/model";

export const Entry = () => {
  const authStore = useAuthContext();
  const user = authStore.use.user();

  const globalStore = useGlobalContext();
  const selectedProvince = globalStore.use.selectedProvince();
  const selectedOutlet = globalStore.use.selectedOutlet();

  const router = useRouter();
  const notification = useNotification();

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

        if (user && user?.account?.role === EUserAccountRole.SALE) {
          router.replace("/sale/lobby");
        } else {
          router.replace("/lobby");
        }
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
        router.replace("/sale/lobby");
      } else if (!selectedProvince || !selectedOutlet) {
        router.replace("/outlet");
      } else {
        router.replace("/lobby");
      }
    }
  }, [user]);

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
              src="/images/nextsystem-logo.webp"
              alt="Nexts System Logo"
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
