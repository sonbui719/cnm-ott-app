export type MessageTab = "all" | "personal" | "group";

export type Conversation = {
  id: number;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  type: "personal" | "group";
  avatarText?: string;
  isBot?: boolean;
};

export const conversations: Conversation[] = [
  {
    id: 1,
    name: "Trần Thị Tư Vấn",
    preview: "Đã gửi tài liệu",
    time: "20-03",
    type: "personal",
    avatarText: "T",
  },
  {
    id: 2,
    name: "Nhóm Tư vấn Đầu tư",
    preview:
      "Xin chào! Tôi là FinBot - trợ lý AI của FinChat. Tôi có thể giúp bạn tra cứu thông tin tài chính, tính toán lãi suất, hoặc giải đáp các thắc mắc cơ bản. Hãy hỏi tôi bất cứ điều gì!",
    time: "20-03",
    unread: 2,
    type: "group",
    isBot: true,
  },
  {
    id: 3,
    name: "FinBot AI",
    preview: "Chưa có tin nhắn",
    time: "",
    type: "personal",
    avatarText: "F",
  },
  {
    id: 4,
    name: "Hỗ trợ Khách hàng VIP",
    preview: "Chưa có tin nhắn",
    time: "",
    unread: 5,
    type: "group",
    isBot: true,
  },
  {
    id: 5,
    name: "Lê Minh Tài Chính",
    preview: "Chưa có tin nhắn",
    time: "",
    unread: 1,
    type: "personal",
    avatarText: "L",
  },
];