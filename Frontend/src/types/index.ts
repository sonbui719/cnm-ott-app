export type Screen =
  | "login"
  | "register"
  | "messages"
  | "groups"
  | "tasks"
  | "ai"
  | "statistics"
  | "profile";

export type MessageType = "group" | "private";
export type TaskStatus = "Cần làm" | "Đang làm" | "Hoàn thành";
export type Priority = "Thấp" | "Trung bình" | "Cao";
export type AiRole = "assistant" | "user";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title?: string;
  online?: boolean;
};

export type MessageThread = {
  id: string;
  name: string;
  avatar: string;
  type: MessageType;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
};

export type Group = {
  id: string;
  name: string;
  avatar: string;
  members: string[];
  description: string;
  role: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  dueDate: string;
  comments: number;
};

export type AiMessage = {
  id: string;
  role: AiRole;
  text: string;
  time: string;
};