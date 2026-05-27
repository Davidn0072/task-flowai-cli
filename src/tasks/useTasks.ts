import { useState, useEffect } from 'react';
import { api } from '../shared/api';
import type { User, TaskSubItem, TaskItem } from '../shared/types';

export function useTasks() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskUserId, setTaskUserId] = useState('1');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [subItemTitle, setSubItemTitle] = useState('');
  const [subItems, setSubItems] = useState<TaskSubItem[]>([]);
  const [editingSubItemId, setEditingSubItemId] = useState<number | null>(null);
  const [editingSubItemTitle, setEditingSubItemTitle] = useState('');
  const [generatingSubtasksFor, setGeneratingSubtasksFor] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  useEffect(() => {
    if (expandedTaskId) loadSubItems(expandedTaskId);
    else {
      setEditingSubItemId(null);
      setEditingSubItemTitle('');
    }
  }, [expandedTaskId]);

  const loadUsers = async () => {
    try {
      const data = await api.get<User[]>('/api/users');
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
    }
  };

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

  const loadSubItems = async (taskId: number) => {
    try {
      const data = await api.get<TaskSubItem[]>(`/api/tasksubitems/task/${taskId}`);
      setSubItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading sub items');
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
      resetTaskForm();
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

  const sharedCardProps = {
    expandedTaskId,
    subItems,
    subItemTitle,
    editingSubItemId,
    editingSubItemTitle,
    loading,
    generatingSubtasksFor,
    onEdit: handleTaskEdit,
    onDelete: handleTaskDelete,
    onToggleExpand: (id: number) => setExpandedTaskId(expandedTaskId === id ? null : id),
    onAddSubItem: handleAddSubItem,
    onToggleSubItem: handleToggleSubItem,
    onStartSubItemEdit: startSubItemEdit,
    onSaveSubItem: handleSaveSubItem,
    onCancelSubItemEdit: cancelSubItemEdit,
    onDeleteSubItem: handleDeleteSubItem,
    onGenerateSubtasks: handleGenerateSubtasks,
    onSubItemTitleChange: setSubItemTitle,
    onEditingSubItemTitleChange: setEditingSubItemTitle,
  };

  return {
    users, tasks, loading, error,
    taskTitle, taskDesc, taskStatus, taskPriority, taskDueDate, taskUserId,
    editingTaskId, isTaskModalOpen,
    expandedTaskId,
    setTaskTitle, setTaskDesc, setTaskStatus, setTaskPriority,
    setTaskDueDate, setTaskUserId,
    handleTaskSubmit, openTaskModal, resetTaskForm,
    sharedCardProps,
  };
}
