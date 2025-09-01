import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div>
      <nav>
        <Link href="/admin/units">Units</Link>
        <Link href="/admin/lessons">Lessons</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
