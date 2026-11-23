import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services & Custom Engineering — uiory",
  description:
    "Hire Uiory for bespoke AI UI components, custom WebGL/GLSL shaders, full design systems, and specialized frontend engineering.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services & Custom Engineering — uiory",
    description:
      "Hire Uiory for bespoke AI UI components, custom WebGL/GLSL shaders, full design systems, and specialized frontend engineering.",
    url: "https://uiory.com/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
