import { ActiveGame } from '@/components/ActiveGame/ActiveGame';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const { id } = await params;
  return <ActiveGame id={id} />;
}
