export default function UnitPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <h1>Pending here</h1>
    </div>
  );
}
