import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '◧', roles: ['Admin', 'Employee'] },
  { to: '/tasks', label: 'Tasks', icon: '☑', roles: ['Admin', 'Employee'] },
  { to: '/employees', label: 'Employees', icon: '☰', roles: ['Admin'] },
  { to: '/reports', label: 'Reports', icon: '▤', roles: ['Admin'] },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/employees': 'Employees',
  '/reports': 'Reports',
};

const AppLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const currentTitle = Object.entries(pageTitles).find(([path]) =>
    window.location.pathname.startsWith(path)
  )?.[1] || 'Task Manager';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          Task<span>MGR</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.filter((item) => item.roles.includes(user?.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div>{user?.fullName}</div>
          <span className="sidebar-user-role">{user?.role}</span>
          <button className="sidebar-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <h1>{currentTitle}</h1>
          <NotificationBell />
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
