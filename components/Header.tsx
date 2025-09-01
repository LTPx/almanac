import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/admin/login');
  };

  return (
    <header>
      <nav>
        <ul>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
