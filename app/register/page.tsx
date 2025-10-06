// app/auth/register/page.tsx
import RegisterClient from "./register-client";

export const dynamic = "force-dynamic"; // evita PPR aqui

export default function Page() {
  return <RegisterClient />;
}
