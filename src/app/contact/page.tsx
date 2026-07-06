import type { Metadata } from "next";
import { ContactPage } from "./contact-client";

export const metadata: Metadata = {
  title: "Contact — SubDNS",
  description:
    "Get in touch with the SubDNS team. Have a question, need help, or want to report abuse? We're here to help.",
};

export default function Page() {
  return <ContactPage />;
}
