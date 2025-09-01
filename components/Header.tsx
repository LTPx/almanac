import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between h-20 px-8 bg-gray-800 text-white border-b border-gray-700">
      <div></div>
      <div>
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
