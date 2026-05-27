import { useState, useEffect } from 'react';
import UserFormModal from './UserFormModal';
import { api } from '../shared/api';
import type { User } from '../shared/types';

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [originalPassword, setOriginalPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

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
    const isEditing = !!editingUserId;

    if (!username || !email) {
      setError('Username and email are required');
      return;
    }

    if (!isEditing) {
      if (!password) {
        setError('Password is required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else if (changePassword) {
      if (!oldPassword) {
        setError('Old password is required');
        return;
      }
      if (!password) {
        setError('New password is required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    try {
      setLoading(true);
      if (isEditing) {
        const pw = changePassword ? password : originalPassword;
        await api.put(`/api/users/${editingUserId}`, {
          user: { id: editingUserId, username, email, password: pw },
          oldPassword: changePassword ? oldPassword : originalPassword,
          confirmPassword: changePassword ? confirmPassword : pw,
        });
      } else {
        await api.post('/api/users', {
          user: { id: 0, username, email, password },
          confirmPassword,
        });
      }
      resetUserForm();
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
    setOriginalPassword(user.password);
    setOldPassword('');
    setPassword('');
    setConfirmPassword('');
    setChangePassword(false);
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

  const resetUserForm = () => {
    setUsername('');
    setEmail('');
    setOldPassword('');
    setPassword('');
    setConfirmPassword('');
    setChangePassword(false);
    setOriginalPassword('');
    setEditingUserId(null);
    setIsUserModalOpen(false);
    setError('');
  };

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      {loading && <p className="text-gray-600 mb-4">Loading...</p>}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <button
          onClick={() => { resetUserForm(); setIsUserModalOpen(true); }}
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
        oldPassword={oldPassword}
        password={password}
        confirmPassword={confirmPassword}
        changePassword={changePassword}
        loading={loading}
        error={error}
        onSubmit={handleUserSubmit}
        onUsernameChange={setUsername}
        onEmailChange={setEmail}
        onOldPasswordChange={setOldPassword}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onChangePasswordToggle={setChangePassword}
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
  );
}
