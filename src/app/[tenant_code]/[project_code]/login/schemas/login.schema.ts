import z from "zod";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Tên đăng nhập không được để trống" })
    .min(3, { message: "Tên đăng nhập tối thiểu 3 kí tự" })
    .max(50, { message: "Tên đăng nhập tối đa 50 kí tự" }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống" }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export { loginSchema };
export type { LoginSchema };
