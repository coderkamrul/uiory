import { redirect } from "next/navigation";

/** Detail pages live on the homepage as ?prompt=[slug] (reference layout). */
export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/?prompt=${slug}`);
}
