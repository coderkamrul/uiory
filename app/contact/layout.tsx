import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — uiory",
  description:
    "Get in touch with the Uiory team for custom component design, shader engineering, or platform questions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us — uiory",
    description:
      "Get in touch with the Uiory team for custom component design, shader engineering, or platform questions.",
    url: "https://uiory.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
