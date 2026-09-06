export interface BlogPost {
  title: string
  slug: string
  date: string
  readingTime: string
  excerpt: string
  content: string[]
}

// Mock content shape is ready to be replaced by markdown/CMS data later.
export const blogPosts: BlogPost[] = [
  {
    title: 'Shadowing không phải là nói theo cho giống',
    slug: 'shadowing-khong-phai-noi-theo-cho-giong',
    date: '28/08/2026',
    readingTime: '4 phút đọc',
    excerpt: 'Một cách nhìn đơn giản hơn về shadowing — và vì sao bắt chước nhịp điệu quan trọng hơn việc cố nói thật nhanh.',
    content: [
      'Có một khoảnh khắc rất dễ nhận ra khi học speaking: bạn nghe một câu tiếng Anh, hiểu từng từ, nhưng khi đến lượt mình nói thì câu bị vỡ ra thành từng mảnh. Bạn biết mình muốn nói gì. Miệng chỉ chưa biết phải đi theo nhịp nào.',
      'Shadowing bắt đầu từ khoảng cách đó. Nó không phải bài tập nói theo cho giống giọng của một người khác. Nó là cách mượn nhịp điệu, khoảng lặng và trọng âm của một câu có sẵn để tạo ra phản xạ mới cho chính mình.',
      'Hãy bắt đầu bằng một đoạn rất ngắn — một câu, hoặc thậm chí nửa câu. Nghe một lần để hiểu ý. Nghe lần hai để để ý chỗ người nói dừng lại. Sau đó nói cùng lúc với audio, không dừng để sửa từng lỗi nhỏ.',
      'Mục tiêu của lần đầu không phải là hoàn hảo. Mục tiêu là giữ được đường đi của câu. Khi cơ thể đã quen với nhịp, phần chính xác sẽ có chỗ để tiến bộ.',
    ],
  },
  {
    title: 'Bạn không thiếu từ vựng. Bạn thiếu những từ của mình',
    slug: 'ban-khong-thieu-tu-vung',
    date: '19/08/2026',
    readingTime: '3 phút đọc',
    excerpt: 'Vì sao một danh sách 1000 từ không giúp bạn nói tốt bằng 10 từ xuất hiện đúng trong cuộc sống của bạn.',
    content: [
      'Một danh sách từ vựng có thể rất dài mà vẫn không tạo ra cảm giác mình đang có thêm ngôn ngữ. Những từ nằm riêng lẻ trên một trang giấy không có ký ức, tình huống hay câu chuyện để bám vào.',
      'Từ vựng cá nhân bắt đầu từ những gì bạn thực sự muốn nói. Một email bạn đang viết. Một video bạn vừa xem. Một câu bạn đã nói nhưng thấy thiếu một từ chính xác hơn.',
      'Khi một từ đi cùng ngữ cảnh của bạn, việc ôn lại không còn là quay lại một bài học xa lạ. Nó là quay lại một ý tưởng quen thuộc và thử diễn đạt nó tốt hơn một chút.',
      'Đó là lý do Mimic bắt đầu từ context, không bắt đầu từ một giáo trình cố định.',
    ],
  },
  {
    title: 'Một practice room nhỏ đang được xây dựng',
    slug: 'mot-practice-room-nho',
    date: '07/08/2026',
    readingTime: '2 phút đọc',
    excerpt: 'Nhật ký ngắn về lý do Mimic ra đời và những điều mình muốn một công cụ luyện nói làm tốt hơn.',
    content: [
      'Mimic bắt đầu từ một nhu cầu rất cá nhân: cần một nơi để nói tiếng Anh mỗi ngày mà không phải chờ đến khi mình sẵn sàng.',
      'Những công cụ hiện tại làm khá tốt việc cung cấp nội dung. Nhưng speaking cần một vòng lặp khác: chọn đúng điều muốn nói, thử nói, nhận một phản hồi đủ cụ thể, rồi quay lại đúng điểm mình hay vấp.',
      'Mình đang xây Mimic như một practice room nhỏ cho vòng lặp đó. Chưa phải một sản phẩm hoàn chỉnh, nhưng mỗi phần đều được làm để trở nên hữu ích trong một buổi học thật.',
    ],
  },
]
