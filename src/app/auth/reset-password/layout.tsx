import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Reset your SubDNS account password securely. Enter your email to receive password reset instructions.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
