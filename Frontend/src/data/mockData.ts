export type MockUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  gender?: string;
  birthday?: string;
  address?: string;
  city?: string;
  country?: string;
  company?: string;
  position?: string;
  department?: string;
  intro?: string;
  skills?: string[];
  socialLinks?: {
    facebook?: string;
    github?: string;
    website?: string;
  };
};

export type MockConversation = {
  id: number;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  type: "personal" | "group";
  avatarText?: string;
  isBot?: boolean;
};

export type MockMessage = {
  id: number;
  conversationId: number;
  sender: "me" | "other";
  content: string;
  time: string;
};

export const mockUser: MockUser = {
  id: "u1",
  fullName: "Nguyễn Văn A",
  email: "user@example.com",
  phone: "84912345678",
  role: "user",
  gender: "Nam",
  birthday: "01/01/2000",
  address: "123 Nguyễn Huệ",
  city: "TP.HCM",
  country: "Việt Nam",
  company: "FinChat",
  position: "Nhân viên tư vấn",
  department: "Chăm sóc khách hàng",
  intro: "Người dùng demo cho ứng dụng OTT tài chính.",
  skills: ["React Native", "Tư vấn", "CSKH"],
  socialLinks: {
    facebook: "",
    github: "",
    website: "",
  },
};

export const mockConversations: MockConversation[] = [
  {
    id: 1,
    name: "Trần Thị Tư Vấn",
    preview: "Chào bạn, hôm nay tôi có thể hỗ trợ gì?",
    time: "08:30",
    unread: 1,
    type: "personal",
    avatarText: "T",
  },
  {
    id: 2,
    name: "Nhóm Tư vấn Đầu tư",
    preview: "FinBot: Tôi có thể hỗ trợ tra cứu thông tin tài chính cho bạn.",
    time: "09:15",
    unread: 2,
    type: "group",
    isBot: true,
  },
  {
    id: 3,
    name: "FinBot AI",
    preview: "Xin chào, tôi là trợ lý AI của bạn.",
    time: "10:00",
    type: "personal",
    avatarText: "F",
    isBot: true,
  },
];

export const mockMessages: MockMessage[] = [
  {
    id: 1,
    conversationId: 1,
    sender: "other",
    content: "Chào bạn, hôm nay tôi có thể hỗ trợ gì?",
    time: "08:30",
  },
  {
    id: 2,
    conversationId: 1,
    sender: "me",
    content: "Mình muốn hỏi về gói dịch vụ hiện tại.",
    time: "08:31",
  },
  {
    id: 3,
    conversationId: 2,
    sender: "other",
    content: "FinBot: Tôi có thể hỗ trợ tra cứu thông tin tài chính cho bạn.",
    time: "09:15",
  },
  {
    id: 4,
    conversationId: 3,
    sender: "other",
    content: "Xin chào, tôi là trợ lý AI của bạn.",
    time: "10:00",
  },
];