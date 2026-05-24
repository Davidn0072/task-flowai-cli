import { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

interface TaskSubItem {
  id: number;
  taskId: number;
  title: string;
  isDone: boolean;
  orderIndex: number | null;
  createdAt: string;
}

interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  createdAt: string;
  userId: number;
  user?: User;
  subItems?: TaskSubItem[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5033';

function App() {
  const [tab, setTab] = useState<'users' | 'tasks'>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskUserId, setTaskUserId] = useState('1');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // SubItems state
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [subItemTitle, setSubItemTitle] = useState('');
  const [subItems, setSubItems] = useState<TaskSubItem[]>([]);
  const [generatingSubtasksFor, setGeneratingSubtasksFor] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else loadTasks();
  }, [tab]);

  useEffect(() => {
    if (expandedTaskId) loadSubItems(expandedTaskId);
  }, [expandedTaskId]);

  // ===== USERS =====
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users`);
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
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
      const url = editingUserId
        ? `${API_URL}/api/users/${editingUserId}`
        : `${API_URL}/api/users`;

      const method = editingUserId ? 'PUT' : 'POST';
      const body = editingUserId
        ? { id: editingUserId, username, email, password }
        : { username, email, password };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save user');

      setUsername('');
      setEmail('');
      setPassword('');
      setEditingUserId(null);
      setError('');
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
  };

  const handleUserDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
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
      const response = await fetch(`${API_URL}/api/tasks`);
      if (!response.ok) throw new Error('Failed to load tasks');
      const data = await response.json();
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
      const url = editingTaskId
        ? `${API_URL}/api/tasks/${editingTaskId}`
        : `${API_URL}/api/tasks`;

      const method = editingTaskId ? 'PUT' : 'POST';
      const body = editingTaskId
        ? {
            id: editingTaskId,
            title: taskTitle,
            description: taskDesc || null,
            status: taskStatus,
            priority: taskPriority,
            dueDate: taskDueDate || null,
            userId: parseInt(taskUserId),
          }
        : {
            title: taskTitle,
            description: taskDesc || null,
            status: taskStatus,
            priority: taskPriority,
            dueDate: taskDueDate || null,
            userId: parseInt(taskUserId),
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save task');

      setTaskTitle('');
      setTaskDesc('');
      setTaskStatus('Todo');
      setTaskPriority('Medium');
      setTaskDueDate('');
      setTaskUserId('1');
      setEditingTaskId(null);
      setError('');
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
  };

  const handleTaskDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
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
      const response = await fetch(`${API_URL}/api/tasksubitems/task/${taskId}`);
      if (!response.ok) throw new Error('Failed to load sub items');
      const data = await response.json();
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
      const response = await fetch(`${API_URL}/api/tasksubitems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          title: subItemTitle,
          isDone: false,
          orderIndex: subItems.length,
        }),
      });

      if (!response.ok) throw new Error('Failed to add sub item');
      setSubItemTitle('');
      setError('');
      loadSubItems(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding sub item');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubItem = async (subItem: TaskSubItem) => {
    try {
      const response = await fetch(`${API_URL}/api/tasksubitems/${subItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subItem,
          isDone: !subItem.isDone,
        }),
      });

      if (!response.ok) throw new Error('Failed to update sub item');
      if (expandedTaskId) loadSubItems(expandedTaskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating sub item');
    }
  };

  const handleDeleteSubItem = async (subItemId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tasksubitems/${subItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete sub item');
      if (expandedTaskId) loadSubItems(expandedTaskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting sub item');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSubtasks = async (taskId: number) => {
    try {
      setGeneratingSubtasksFor(taskId);
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/generate-subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to generate subtasks');
      setError('');
      setExpandedTaskId(taskId);
      loadSubItems(taskId);
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
    setTaskUserId('1');
    setEditingTaskId(null);
  };

  const resetUserForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setEditingUserId(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">TaskFlow</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded ${tab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          Users
        </button>
        <button
          onClick={() => setTab('tasks')}
          className={`px-4 py-2 rounded ${tab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          Tasks
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      {loading && <p className="text-gray-600 mb-4">Loading...</p>}

      {tab === 'users' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <form onSubmit={handleUserSubmit} className="bg-gray-100 p-4 rounded mb-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {editingUserId ? 'Update' : 'Add'} User
              </button>
              {editingUserId && (
                <button
                  type="button"
                  onClick={resetUserForm}
                  disabled={loading}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

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
          <h2 className="text-2xl font-bold mb-4">Tasks</h2>
          <form onSubmit={handleTaskSubmit} className="bg-gray-100 p-4 rounded mb-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                disabled={loading}
              />
              <textarea
                placeholder="Description"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                disabled={loading}
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="px-3 py-2 border rounded"
                  disabled={loading}
                >
                  <option>Todo</option>
                  <option>InProgress</option>
                  <option>Done</option>
                </select>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="px-3 py-2 border rounded"
                  disabled={loading}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="px-3 py-2 border rounded"
                  disabled={loading}
                />
                <select
                  value={taskUserId}
                  onChange={(e) => setTaskUserId(e.target.value)}
                  className="px-3 py-2 border rounded"
                  disabled={loading}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {editingTaskId ? 'Update' : 'Add'} Task
              </button>
              {editingTaskId && (
                <button
                  type="button"
                  onClick={resetTaskForm}
                  disabled={loading}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <p className="text-gray-600">No tasks yet</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="bg-white border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{task.title}</p>
                    <span className={`px-2 py-1 rounded text-sm text-white ${
                      task.status === 'Done' ? 'bg-green-500' :
                      task.status === 'InProgress' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  {task.description && <p className="text-gray-600 mb-2">{task.description}</p>}
                  <div className="text-sm text-gray-500 mb-3">
                    <p>Priority: {task.priority}</p>
                    {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                    <p>User: {task.user?.username || 'Unknown'}</p>
                  </div>

                  {/* Sub Items Section */}
                  <div className="mb-3 bg-gray-50 p-3 rounded">
                    <button
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                      className="font-semibold text-sm text-blue-600 hover:underline mb-2"
                    >
                      {expandedTaskId === task.id ? '▼' : '▶'} Subtasks ({subItems.filter(s => s.taskId === task.id).length})
                    </button>

                    {expandedTaskId === task.id && (
                      <div>
                        {subItems.filter(s => s.taskId === task.id).length > 0 && (
                          <div className="mb-2 space-y-1">
                            {subItems
                              .filter(s => s.taskId === task.id)
                              .map((subItem) => (
                                <div key={subItem.id} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={subItem.isDone}
                                    onChange={() => handleToggleSubItem(subItem)}
                                    className="w-4 h-4"
                                  />
                                  <span className={subItem.isDone ? 'line-through text-gray-400' : ''}>
                                    {subItem.title}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteSubItem(subItem.id)}
                                    disabled={loading}
                                    className="ml-auto text-red-500 hover:text-red-700 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="New subtask..."
                            value={expandedTaskId === task.id ? subItemTitle : ''}
                            onChange={(e) => setSubItemTitle(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddSubItem(task.id);
                            }}
                            disabled={loading}
                          />
                          <button
                            onClick={() => handleAddSubItem(task.id)}
                            disabled={loading}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTaskEdit(task)}
                      disabled={loading}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleGenerateSubtasks(task.id)}
                      disabled={loading || generatingSubtasksFor === task.id}
                      className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 disabled:bg-gray-400 text-sm"
                    >
                      {generatingSubtasksFor === task.id ? 'Generating...' : '✨ AI Subtasks'}
                    </button>
                    <button
                      onClick={() => handleTaskDelete(task.id)}
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
    </div>
  );
}

export default App
