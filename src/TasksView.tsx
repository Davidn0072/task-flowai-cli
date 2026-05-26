import TaskFormModal from './TaskFormModal';
import TaskCard from './TaskCard';
import { useTasks } from './useTasks';

export default function TasksView() {
  const {
    users, tasks, loading, error,
    taskTitle, taskDesc, taskStatus, taskPriority, taskDueDate, taskUserId,
    editingTaskId, isTaskModalOpen,
    setTaskTitle, setTaskDesc, setTaskStatus, setTaskPriority,
    setTaskDueDate, setTaskUserId,
    handleTaskSubmit, openTaskModal, resetTaskForm,
    expandedTaskId, sharedCardProps,
  } = useTasks();

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      {loading && <p className="text-gray-600 mb-4">Loading...</p>}

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
              {...sharedCardProps}
              subItemTitle={expandedTaskId === task.id ? sharedCardProps.subItemTitle : ''}
            />
          ))
        )}
      </div>
    </div>
  );
}
