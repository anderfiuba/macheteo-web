import { ResumenProgress } from "@/components/ResumenProgress";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResumenProgress id={id} />;
}
