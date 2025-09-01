import Sidebar from './admin/Sidebar';
import Header from './Header';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-8 text-white">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
