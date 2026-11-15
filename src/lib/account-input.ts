import { z } from "zod";

export const signupInput = z.object({
  name:z.string().trim().min(2,"이름은 2자 이상 입력해 주세요.").max(30),
  email:z.string().trim().email("올바른 이메일을 입력해 주세요."),
  password:z.string().min(10,"비밀번호는 10자 이상이어야 합니다.").max(72).regex(/[A-Za-z]/,"영문을 포함해 주세요.").regex(/[0-9]/,"숫자를 포함해 주세요."),
});
export const passwordChangeInput = z.object({ currentPassword:z.string().min(1), newPassword:signupInput.shape.password });
