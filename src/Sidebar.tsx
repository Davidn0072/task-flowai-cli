import { NavLink } from 'react-router-dom';

interface SidebarProps {
  currentUser: string;
  onLogout: () => void;
}

export default function Sidebar({ currentUser, onLogout }: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block w-full text-left px-4 py-3 rounded-lg transition ${
      isActive ? 'bg-white text-blue-600 font-semibold' : 'text-white hover:bg-blue-500'
    }`;

  return (
    <aside className="w-64 bg-blue-600 text-white h-screen fixed left-0 top-0 flex flex-col p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">TaskFlow</h1>
        <p className="text-blue-100 text-sm mt-1">Welcome, {currentUser}</p>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink to="/board" className={linkClass}>
          📌 Board
        </NavLink>
        <NavLink to="/tasks" className={linkClass}>
          📋 Tasks
        </NavLink>
        <NavLink to="/users" className={linkClass}>
          👥 Users
        </NavLink>
      </nav>

      <button
        onClick={onLogout}
        className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
      >
        Logout
      </button>
    </aside>
  );
}
