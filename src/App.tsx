import { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Register from './Register';
import Sidebar from './Sidebar';
import UserFormModal from './UserFormModal';
import TaskFormModal from './TaskFormModal';
import TaskCard from './TaskCard';
import { api } from './api';
import type { User, TaskSubItem, TaskItem } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [tab, setTab] = useState<'users' | 'tasks'>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskUserId, setTaskUserId] = useState('1');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // SubItems state
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [subItemTitle, setSubItemTitle] = useState('');
  const [subItems, setSubItems] = useState<TaskSubItem[]>([]);
  const [editingSubItemId, setEditingSubItemId] = useState<number | null>(null);
  const [editingSubItemTitle, setEditingSubItemTitle] = useState('');
  const [generatingSubtasksFor, setGeneratingSubtasksFor] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user.username);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (storedUser || storedToken) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    const handleLogoutEvent = () => {
      handleLogout();
    };
    window.addEventListener('logout', handleLogoutEvent);
    return () => window.removeEventListener('logout', handleLogoutEvent);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (tab === 'users') loadUsers();
    else {
      loadTasks();
      loadUsers();
    }
  }, [tab, isLoggedIn]);

  useEffect(() => {
    if (expandedTaskId) loadSubItems(expandedTaskId);
    else {
      setEditingSubItemId(null);
      setEditingSubItemTitle('');
    }
  }, [expandedTaskId]);

  // ===== USERS =====
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get<User[]>('/api/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('All fields required');
      return;
    }

    try {
      setLoading(true);
      const body = editingUserId
        ? { id: editingUserId, username, email, password }
        : { username, email, password };

      if (editingUserId) {
        await api.put(`/api/users/${editingUserId}`, body);
      } else {
        await api.post('/api/users', body);
      }

      setUsername('');
      setEmail('');
      setPassword('');
      setEditingUserId(null);
      setError('');
      setIsUserModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving user');
    } finally {
      setLoading(false);
    }
  };

  const handleUserEdit = (user: User) => {
    setUsername(user.username);
    setEmail(user.email);
    setPassword(user.password);
    setEditingUserId(user.id);
    setIsUserModalOpen(true);
    setError('');
  };

  const handleUserDelete = async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/api/users/${id}`);
      setError('');
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  // ===== TASKS =====
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.get<TaskItem[]>('/api/tasks');
      setTasks(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!taskTitle || !taskUserId) {
      setError('Title and User are required');
      return;
    }

    try {
      setLoading(true);
      const body = {
        title: taskTitle,
        description: taskDesc || null,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        userId: parseInt(taskUserId),
      };

      if (editingTaskId) {
        await api.put(`/api/tasks/${editingTaskId}`, { id: editingTaskId, ...body });
      } else {
        await api.post('/api/tasks', body);
      }

      setTaskTitle('');
      setTaskDesc('');
      setTaskStatus('Todo');
      setTaskPriority('Medium');
      setTaskDueDate('');
      setTaskUserId('1');
      setEditingTaskId(null);
      setError('');
      setIsTaskModalOpen(false);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving task');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskEdit = (task: TaskItem) => {
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskStatus(task.status || 'Todo');
    setTaskPriority(task.priority || 'Medium');
    setTaskDueDate(task.dueDate?.split('T')[0] || '');
    setTaskUserId(task.userId.toString());
    setEditingTaskId(task.id);
    setIsTaskModalOpen(true);
    setError('');
  };

  const handleTaskDelete = async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/api/tasks/${id}`);
      setError('');
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting task');
    } finally {
      setLoading(false);
    }
  };

  // ===== SUB ITEMS =====
  const loadSubItems = async (taskId: number) => {
    try {
      const data = await api.get<TaskSubItem[]>(`/api/tasksubitems/task/${taskId}`);
      setSubItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading sub items');
    }
  };

  const handleAddSubItem = async (taskId: number) => {
    if (!subItemTitle.trim()) {
      setError('Sub item title required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/tasksubitems', {
        taskId,
        title: subItemTitle,
        isDone: false,
        orderIndex: subItems.length,
      });

      setSubItemTitle('');
      setError('');
      await loadSubItems(taskId);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding sub item');
    } finally {
      setLoading(false);
    }
  };

  const startSubItemEdit = (subItem: TaskSubItem) => {
    setEditingSubItemId(subItem.id);
    setEditingSubItemTitle(subItem.title);
  };

  const cancelSubItemEdit = () => {
    setEditingSubItemId(null);
    setEditingSubItemTitle('');
  };

  const handleSaveSubItem = async (subItem: TaskSubItem) => {
    if (!editingSubItemTitle.trim()) {
      setError('Sub item title required');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/api/tasksubitems/${subItem.id}`, {
        id: subItem.id,
        taskId: subItem.taskId,
        title: editingSubItemTitle.trim(),
        isDone: subItem.isDone,
        orderIndex: subItem.orderIndex,
      });

      cancelSubItemEdit();
      setError('');
      if (expandedTaskId) {
        await loadSubItems(expandedTaskId);
        await loadTasks();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating sub item');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubItem = async (subItem: TaskSubItem) => {
    if (editingSubItemId === subItem.id) return;

    try {
      await api.put(`/api/tasksubitems/${subItem.id}`, {
        id: subItem.id,
        taskId: subItem.taskId,
        title: subItem.title,
        isDone: !subItem.isDone,
        orderIndex: subItem.orderIndex,
      });

      if (expandedTaskId) {
        await loadSubItems(expandedTaskId);
        await loadTasks();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating sub item');
    }
  };

  const handleDeleteSubItem = async (subItemId: number) => {
    try {
      setLoading(true);
      await api.delete(`/api/tasksubitems/${subItemId}`);

      if (expandedTaskId) {
        await loadSubItems(expandedTaskId);
        await loadTasks();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting sub item');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSubtasks = async (taskId: number) => {
    try {
      setGeneratingSubtasksFor(taskId);
      await api.post(`/api/tasks/${taskId}/generate-subtasks`, {});

      setError('');
      setExpandedTaskId(taskId);
      await loadSubItems(taskId);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating subtasks');
    } finally {
      setGeneratingSubtasksFor(null);
    }
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskStatus('Todo');
    setTaskPriority('Medium');
    setTaskDueDate('');
    setTaskUserId(users.length > 0 ? users[0].id.toString() : '1');
    setEditingTaskId(null);
    setIsTaskModalOpen(false);
    setError('');
  };

  const openTaskModal = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskStatus('Todo');
    setTaskPriority('Medium');
    setTaskDueDate('');
    setTaskUserId(users.length > 0 ? users[0].id.toString() : '1');
    setEditingTaskId(null);
    setError('');
    setIsTaskModalOpen(true);
  };

  const resetUserForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setEditingUserId(null);
    setIsUserModalOpen(false);
    setError('');
  };

  const openUserModal = () => {
    resetUserForm();
    setIsUserModalOpen(true);
  };

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleRegisterSuccess = () => {
    setAuthPage('login');
  };

  const handleSwitchToRegister = () => {
    setAuthPage('register');
  };

  const handleSwitchToLogin = () => {
    setAuthPage('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser('');
    setIsLoggedIn(false);
    setTab('users');
  };

  if (!isLoggedIn) {
    if (authPage === 'register') {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={handleSwitchToRegister}
      />
    );
  }

  return (
    <div className="flex">
      <Sidebar
        currentTab={tab}
        onTabChange={setTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-64 p-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
        {loading && <p className="text-gray-600 mb-4">Loading...</p>}

      {tab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Users</h2>
            <button
              onClick={openUserModal}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 font-medium"
            >
              + Add User
            </button>
          </div>

          <UserFormModal
            isOpen={isUserModalOpen}
            user={editingUserId ? users.find(u => u.id === editingUserId) || null : null}
            username={username}
            email={email}
            password={password}
            loading={loading}
            error={error}
            onSubmit={handleUserSubmit}
            onUsernameChange={setUsername}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onClose={resetUserForm}
          />

          <div className="grid gap-4">
            {users.length === 0 ? (
              <p className="text-gray-600">No users yet</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-white border rounded p-4">
                  <p className="font-bold">{user.username}</p>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleUserEdit(user)}
                      disabled={loading}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleUserDelete(user.id)}
                      disabled={loading}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Tasks</h2>
            <button
              onClick={openTaskModal}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 font-medium"
            >
              + Add Task
            </button>
          </div>

          <TaskFormModal
            isOpen={isTaskModalOpen}
            isEditing={editingTaskId !== null}
            title={taskTitle}
            description={taskDesc}
            status={taskStatus}
            priority={taskPriority}
            dueDate={taskDueDate}
            userId={taskUserId}
            users={users}
            loading={loading}
            error={error}
            onSubmit={handleTaskSubmit}
            onTitleChange={setTaskTitle}
            onDescriptionChange={setTaskDesc}
            onStatusChange={setTaskStatus}
            onPriorityChange={setTaskPriority}
            onDueDateChange={setTaskDueDate}
            onUserIdChange={setTaskUserId}
            onClose={resetTaskForm}
          />

          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <p className="text-gray-600">No tasks yet</p>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  expandedTaskId={expandedTaskId}
                  subItems={subItems}
                  subItemTitle={expandedTaskId === task.id ? subItemTitle : ''}
                  editingSubItemId={editingSubItemId}
                  editingSubItemTitle={editingSubItemTitle}
                  loading={loading}
                  generatingSubtasksFor={generatingSubtasksFor}
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                  onToggleExpand={(id) => setExpandedTaskId(expandedTaskId === id ? null : id)}
                  onAddSubItem={handleAddSubItem}
                  onToggleSubItem={handleToggleSubItem}
                  onStartSubItemEdit={startSubItemEdit}
                  onSaveSubItem={handleSaveSubItem}
                  onCancelSubItemEdit={cancelSubItemEdit}
                  onDeleteSubItem={handleDeleteSubItem}
                  onGenerateSubtasks={handleGenerateSubtasks}
                  onSubItemTitleChange={setSubItemTitle}
                  onEditingSubItemTitleChange={setEditingSubItemTitle}
                />
              ))
            )}
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default App
