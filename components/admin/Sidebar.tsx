import Link from 'next/link';
import { Book, GraduationCap } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin</h1>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        <Link href="/admin/units">
          <a className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200">
            <Book className="w-5 h-5 mr-3" />
            Units
          </a>
        </Link>
        <Link href="/admin/lessons">
          <a className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200">
            <GraduationCap className="w-5 h-5 mr-3" />
            Lessons
          </a>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
