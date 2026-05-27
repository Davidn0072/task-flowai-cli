import { useRef } from 'react';
import type { TaskItem, TaskSubItem } from '../shared/types';

const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface TaskCardProps {
  task: TaskItem;
  expandedTaskId: number | null;
  subItems: TaskSubItem[];
  subItemTitle: string;
  editingSubItemId: number | null;
  editingSubItemTitle: string;
  loading: boolean;
  generatingSubtasksFor: number | null;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onAddSubItem: (taskId: number) => void;
  onToggleSubItem: (subItem: TaskSubItem) => void;
  onStartSubItemEdit: (subItem: TaskSubItem) => void;
  onSaveSubItem: (subItem: TaskSubItem) => void;
  onCancelSubItemEdit: () => void;
  onDeleteSubItem: (id: number) => void;
  onGenerateSubtasks: (taskId: number) => void;
  onSubItemTitleChange: (value: string) => void;
  onEditingSubItemTitleChange: (value: string) => void;
}

export default function TaskCard({
  task,
  expandedTaskId,
  subItems,
  subItemTitle,
  editingSubItemId,
  editingSubItemTitle,
  loading,
  generatingSubtasksFor,
  onEdit,
  onDelete,
  onToggleExpand,
  onAddSubItem,
  onToggleSubItem,
  onStartSubItemEdit,
  onSaveSubItem,
  onCancelSubItemEdit,
  onDeleteSubItem,
  onGenerateSubtasks,
  onSubItemTitleChange,
  onEditingSubItemTitleChange,
}: TaskCardProps) {
  const isExpanded = expandedTaskId === task.id;
  const subItemInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white border rounded p-4">
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
        <div className="flex items-center gap-2 mt-1">
          {task.user ? (
            <>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(task.user.username)}`}>
                {task.user.username[0].toUpperCase()}
              </span>
              <span>{task.user.username}</span>
            </>
          ) : (
            <span>Unknown</span>
          )}
        </div>
      </div>

      <div className="mb-3 bg-gray-50 p-3 rounded">
        <button
          onClick={() => onToggleExpand(task.id)}
          className="font-semibold text-sm text-blue-600 hover:underline mb-2"
        >
          {isExpanded ? '▼' : '▶'} Subtasks ({task.subItemsCount})
        </button>

        {isExpanded && (
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
                        onChange={() => onToggleSubItem(subItem)}
                        disabled={loading || editingSubItemId === subItem.id}
                        className="w-4 h-4 shrink-0"
                      />
                      {editingSubItemId === subItem.id ? (
                        <>
                          <input
                            type="text"
                            value={editingSubItemTitle}
                            onChange={(e) => onEditingSubItemTitleChange(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                            disabled={loading}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') onSaveSubItem(subItem);
                              if (e.key === 'Escape') onCancelSubItemEdit();
                            }}
                          />
                          <button
                            onClick={() => onSaveSubItem(subItem)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={onCancelSubItemEdit}
                            disabled={loading}
                            className="text-gray-500 hover:text-gray-700 text-xs"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={`flex-1 ${subItem.isDone ? 'line-through text-gray-400' : ''}`}>
                            {subItem.title}
                          </span>
                          <button
                            onClick={() => onStartSubItemEdit(subItem)}
                            disabled={loading}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteSubItem(subItem.id)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={subItemInputRef}
                type="text"
                placeholder="New subtask..."
                value={subItemTitle}
                onChange={(e) => onSubItemTitleChange(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAddSubItem(task.id);
                }}
                disabled={loading}
              />
              <button
                onClick={() => { onAddSubItem(task.id); subItemInputRef.current?.focus(); }}
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
          onClick={() => onEdit(task)}
          disabled={loading}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Edit
        </button>
        <button
          onClick={() => onGenerateSubtasks(task.id)}
          disabled={loading || generatingSubtasksFor === task.id}
          className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 disabled:bg-gray-400 text-sm"
        >
          {generatingSubtasksFor === task.id ? 'Generating...' : '✨ AI Subtasks'}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          disabled={loading}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
