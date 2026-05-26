export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface TaskSubItem {
  id: number;
  taskId: number;
  title: string;
  isDone: boolean;
  orderIndex: number | null;
  createdAt: string;
}

export interface TaskItem {
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
  subItemsCount: number;
}
