import { describe, expect, it } from "vitest";
import { passwordChangeInput, signupInput } from "./account-input";

describe("account input",()=>{
  it("accepts a valid signup",()=>{expect(signupInput.safeParse({name:"홍길동",email:"user@example.com",password:"studyMate2026"}).success).toBe(true);});
  it("rejects short or single-type passwords",()=>{expect(signupInput.safeParse({name:"홍길동",email:"user@example.com",password:"1234567890"}).success).toBe(false);expect(signupInput.safeParse({name:"홍길동",email:"user@example.com",password:"Abc123"}).success).toBe(false);});
  it("requires both passwords for a change",()=>{expect(passwordChangeInput.safeParse({currentPassword:"old-password",newPassword:"newStudy2026"}).success).toBe(true);});
});
