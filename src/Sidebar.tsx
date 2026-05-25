interface SidebarProps {
  currentTab: 'users' | 'tasks';
  onTabChange: (tab: 'users' | 'tasks') => void;
  currentUser: string;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, onTabChange, currentUser, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-blue-600 text-white h-screen fixed left-0 top-0 flex flex-col p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">TaskFlow</h1>
        <p className="text-blue-100 text-sm mt-1">Welcome, {currentUser}</p>
      </div>

      <nav className="flex-1 space-y-2">
        <button
          onClick={() => onTabChange('tasks')}
          className={`w-full text-left px-4 py-3 rounded-lg transition ${
            currentTab === 'tasks'
              ? 'bg-white text-blue-600 font-semibold'
              : 'text-white hover:bg-blue-500'
          }`}
        >
          📋 Tasks
        </button>
        <button
          onClick={() => onTabChange('users')}
          className={`w-full text-left px-4 py-3 rounded-lg transition ${
            currentTab === 'users'
              ? 'bg-white text-blue-600 font-semibold'
              : 'text-white hover:bg-blue-500'
          }`}
        >
          👥 Users
        </button>
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
