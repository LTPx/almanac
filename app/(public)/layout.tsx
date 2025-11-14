export default async function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <div className="">{children}</div>
    </main>
  );
}
