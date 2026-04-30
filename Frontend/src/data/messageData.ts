// Định nghĩa các tab chuyển đổi
export type MessageTab = "all" | "personal" | "group";

// Định nghĩa cấu trúc chuẩn của một cuộc trò chuyện
export type Conversation = {
  id: string | number; // Nhận string từ MongoDB ID
  name: string;
  preview: string;
  time: string;
  unread?: number;
  type: "personal" | "group";
  avatarText?: string;
  isBot?: boolean;
};

// Khởi tạo mảng rỗng thay vì dữ liệu mẫu. 
// Điều này giúp các component cũ nếu có lỡ import biến này sẽ không bị lỗi "undefined".
export const conversations: Conversation[] = [];