import { AiMessage, Group, MessageThread, Task, User } from "../types";
    description: "Nhóm phát triển sản phẩm - Nơi trao đổi kỹ thuật và tiến độ dự án.",
    role: "Admin",
  },
  {
    id: "g2",
    name: "Marketing",
    avatar: "🟠",
    members: ["u1", "u4", "u5"],
    description: "Nhóm marketing và truyền thông - Chiến lược và nội dung.",
    role: "Admin",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Viết content cho landing page",
    description: "Soạn nội dung cho trang chủ và các trang giới thiệu sản phẩm.",
    status: "Cần làm",
    priority: "Trung bình",
    assigneeId: "u5",
    dueDate: "25/03",
    comments: 0,
  },
  {
    id: "t2",
    title: "Setup CI/CD pipeline",
    description: "Cấu hình GitHub Actions cho việc deploy tự động.",
    status: "Cần làm",
    priority: "Trung bình",
    assigneeId: "u3",
    dueDate: "30/03",
    comments: 0,
  },
  {
    id: "t3",
    title: "Implement API authentication",
    description: "Xây dựng hệ thống xác thực JWT cho API.",
    status: "Đang làm",
    priority: "Cao",
    assigneeId: "u3",
    dueDate: "20/03",
    comments: 0,
  },
  {
    id: "t4",
    title: "Review và optimize database queries",
    description: "Kiểm tra và tối ưu các truy vấn để cải thiện hiệu năng.",
    status: "Đang làm",
    priority: "Thấp",
    assigneeId: "u3",
    dueDate: "05/04",
    comments: 0,
  },
  {
    id: "t5",
    title: "Hoàn thành thiết kế UI dashboard",
    description: "Thiết kế giao diện dashboard cho admin panel.",
    status: "Hoàn thành",
    priority: "Cao",
    assigneeId: "u4",
    dueDate: "10/03",
    comments: 1,
  },
];

export const aiMessages: AiMessage[] = [
  {
    id: "a1",
    role: "assistant",
    text: "Xin chào! Tôi là trợ lý AI của StartupChat. Tôi có thể giúp bạn trả lời câu hỏi về dự án, tạo task mới, tóm tắt hội thoại và gợi ý ý tưởng.",
    time: "07:00",
  },
  { id: "a2", role: "user", text: "Gợi ý ý tưởng", time: "11:08" },
  {
    id: "a3",
    role: "assistant",
    text: "Đây là một số gợi ý cho dự án của bạn: 1. Thêm onboarding flow. 2. Lazy loading cho ảnh. 3. Notification real-time. 4. Analytics theo dõi hành vi người dùng.",
    time: "11:08",
  },
];