import { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';
import { useTasks } from './useTasks';
import { api } from './api';
import type { TaskItem } from './types';

const COLUMNS: { status: string; label: string; color: string }[] = [
  { status: 'Todo',       label: 'To Do',       color: 'bg-gray-200 text-gray-700'   },
  { status: 'InProgress', label: 'In Progress',  color: 'bg-yellow-200 text-yellow-800' },
  { status: 'Done',       label: 'Done',         color: 'bg-green-200 text-green-800'  },
];

const PRIORITIES: { value: string; label: string; activeClass: string }[] = [
  { value: '',       label: 'All',    activeClass: 'bg-blue-500 text-white border-blue-500'   },
  { value: 'High',   label: 'High',   activeClass: 'bg-red-500 text-white border-red-500'     },
  { value: 'Medium', label: 'Medium', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'Low',    label: 'Low',    activeClass: 'bg-green-500 text-white border-green-500'  },
];

type SearchMode = 'fields' | 'ai';

export default function BoardView() {
  const {
    users, tasks, loading, error,
    taskTitle, taskDesc, taskStatus, taskPriority, taskDueDate, taskUserId,
    editingTaskId, isTaskModalOpen,
    setTaskTitle, setTaskDesc, setTaskStatus, setTaskPriority,
    setTaskDueDate, setTaskUserId,
    handleTaskSubmit, openTaskModal, resetTaskForm,
    expandedTaskId, sharedCardProps,
  } = useTasks();

  const [searchMode, setSearchMode] = useState<SearchMode>('fields');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchTasks, setSearchTasks] = useState<TaskItem[] | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  useEffect(() => {
    if (!searchText.trim()) {
      setSearchTasks(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await api.get<TaskItem[]>(`/api/tasks/search?q=${encodeURIComponent(searchText)}`);
        setSearchTasks(results);
      } catch {
        setSearchTasks(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const toggleUser = (userId: number) =>
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );

  const displayTasks = searchTasks ?? tasks;

  const tasksByStatus = (status: string): TaskItem[] =>
    displayTasks.filter((t) =>
      t.status === status &&
      (filterPriority === '' || t.priority === filterPriority) &&
      (selectedUserIds.length === 0 || selectedUserIds.includes(t.userId))
    );

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      {loading && <p className="text-gray-600 mb-4">Loading...</p>}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Board</h2>
        <button
          onClick={openTaskModal}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 font-medium"
        >
          + Add Task
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        {/* Mode Toggle */}
        <div className="flex rounded-md border border-gray-300 overflow-hidden text-sm font-medium">
          <button
            onClick={() => setSearchMode('fields')}
            className={`px-3 py-1.5 transition-colors ${searchMode === 'fields' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Fields
          </button>
          <button
            onClick={() => setSearchMode('ai')}
            className={`px-3 py-1.5 transition-colors border-l border-gray-300 ${searchMode === 'ai' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            ✦ AI
          </button>
        </div>

        {/* Fields Mode */}
        {searchMode === 'fields' && (
          <div className="flex flex-col gap-2 flex-1">
            {/* Row 1: Priority + Text search */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Priority:</span>
                {PRIORITIES.map(({ value, label, activeClass }) => (
                  <button
                    key={value}
                    onClick={() => setFilterPriority(value)}
                    className={`px-3 py-1 text-xs rounded-full font-medium border transition-colors ${
                      filterPriority === value
                        ? activeClass
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Search:</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Title or description..."
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {/* Row 2: Users */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 font-medium">Users:</span>
              <select
                value=""
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (id) toggleUser(id);
                }}
                className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-gray-600"
              >
                <option value="">Add user...</option>
                {users
                  .filter((u) => !selectedUserIds.includes(u.id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
              </select>
              {selectedUserIds.map((uid) => {
                const user = users.find((u) => u.id === uid);
                if (!user) return null;
                return (
                  <span
                    key={uid}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium bg-purple-500 text-white"
                  >
                    {user.username}
                    <button onClick={() => toggleUser(uid)} className="hover:opacity-70 leading-none">✕</button>
                  </span>
                );
              })}
              {selectedUserIds.length > 0 && (
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Mode */}
        {searchMode === 'ai' && (
          <span className="text-sm text-gray-400 italic">AI search — coming soon</span>
        )}
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

      <div className="flex gap-4 items-start">
        {COLUMNS.map(({ status, label, color }) => (
          <div key={status} className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 ${color}`}>
              <span className="font-semibold">{label}</span>
              <span className="text-sm font-medium bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                {tasksByStatus(status).length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {tasksByStatus(status).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No tasks</p>
              ) : (
                tasksByStatus(status).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    {...sharedCardProps}
                    subItemTitle={expandedTaskId === task.id ? sharedCardProps.subItemTitle : ''}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
