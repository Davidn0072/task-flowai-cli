import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';
import { useTasks } from './useTasks';
import type { TaskItem } from './types';

const COLUMNS: { status: string; label: string; color: string }[] = [
  { status: 'Todo',       label: 'To Do',       color: 'bg-gray-200 text-gray-700'   },
  { status: 'InProgress', label: 'In Progress',  color: 'bg-yellow-200 text-yellow-800' },
  { status: 'Done',       label: 'Done',         color: 'bg-green-200 text-green-800'  },
];

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

  const tasksByStatus = (status: string): TaskItem[] =>
    tasks.filter((t) => t.status === status);

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      {loading && <p className="text-gray-600 mb-4">Loading...</p>}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Board</h2>
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
