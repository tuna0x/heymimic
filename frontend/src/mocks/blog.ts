export interface BlogPost {
  title: string
  slug: string
  date: string
  readingTime: string
  category: 'Shadowing' | 'Contextual Vocab' | 'Tâm lý học' | 'Nhật ký phát triển'
  excerpt: string
  content: string[]
  pullQuote: string
  keyTakeaways: string[]
  author: {
    name: string
    role: string
    initials: string
  }
}

export const blogPosts: BlogPost[] = [
  {
    title: 'Shadowing không phải là nói theo cho giống giọng',
    slug: 'shadowing-cadence-over-accent',
    date: '04/09/2026',
    readingTime: '4 phút đọc',
    category: 'Shadowing',
    excerpt: 'Một góc nhìn mới về kỹ thuật Shadowing — vì sao bắt chước nhịp điệu (cadence) và khoảng lặng quan trọng hơn việc cố nói thật nhanh hay giống giọng Mỹ.',
    content: [
      'Có một khoảnh khắc rất dễ nhận ra khi học speaking: bạn nghe một câu tiếng Anh, hiểu từng từ một, nhưng khi đến lượt mình nói thì câu nói bị vỡ vụn thành từng mảnh rời rạc. Bạn biết rõ mình muốn diễn đạt ý gì, nhưng cơ miệng và hơi thở chưa kịp bắt nhịp.',
      'Shadowing bắt đầu từ khoảng cách đó. Nó không phải là bài tập ép bản thân phát âm thật nhanh hay sao chép tông giọng của một diễn giả nổi tiếng. Bản chất sâu xa của Shadowing là mượn nhịp điệu (rhythm), khoảng ngắt hơi (pauses) và trọng âm (stress) của một câu có sẵn để tái lập phản xạ cơ miệng cho chính bạn.',
      'Khi thực hành tại HeyMimic, chúng mình khuyên người học hãy bắt đầu bằng một đơn vị rất ngắn — một vế câu từ 5 đến 8 từ. Nghe lần đầu tiên để hiểu trọn vẹn ngữ cảnh. Nghe lần thứ hai để nhận ra nơi người nói thả lỏng và nhấn nhá. Sau đó, mở mic và nói cùng lúc với âm thanh mẫu.',
      'Mục tiêu của lần đầu không bao giờ là hoàn hảo. Mục tiêu là giữ được đường đi mượt mà của câu. Khi cơ thể đã quen với nhịp điệu, các chi tiết về âm đuôi /s/, /t/ sẽ tự động tìm được vị trí rơi tự nhiên nhất.',
    ],
    pullQuote: '“Shadowing không phải sao chép giọng của người khác. Đó là cách mượn nhịp điệu để giải phóng giọng nói của chính bạn.”',
    keyTakeaways: [
      'Tập trung vào nhịp điệu và khoảng ngắt hơi trước khi quan tâm đến tốc độ.',
      'Bắt đầu từ những đoạn ngắn 60 giây để tránh làm cạn kiệt năng lượng thanh quản.',
      'Đừng dừng lại để sửa lỗi vụn vặt giữa chừng; hãy hoàn tất cả câu rồi nghe lại.',
    ],
    author: {
      name: 'Tuna',
      role: 'Creator of HeyMimic',
      initials: 'TN',
    },
  },
  {
    title: 'Bạn không thiếu từ vựng. Bạn thiếu những từ của chính mình',
    slug: 'contextual-vocabulary-mastery',
    date: '28/08/2026',
    readingTime: '3 phút đọc',
    category: 'Contextual Vocab',
    excerpt: 'Vì sao học thuộc danh sách 1.000 từ vựng không giúp bạn tự tin bằng 10 từ xuất hiện đúng trong công việc và cuộc sống hàng ngày.',
    content: [
      'Một cuốn sổ tay ghi chép hàng nghìn từ vựng có thể rất dày, nhưng vẫn không mang lại cảm giác bạn đang thực sự sở hữu ngôn ngữ đó. Những từ vựng nằm trơ trọi trên trang giấy thiếu đi ký ức, thiếu tình huống cảm xúc và thiếu lý do để não bộ kích hoạt khi trò chuyện.',
      'Từ vựng sống động phải bắt đầu từ ngữ cảnh của chính bạn. Một email công việc bạn vừa gửi cho đối tác. Một đoạn video chia sẻ chuyên môn bạn vừa xem trên YouTube. Hay một câu thảo luận trong buổi họp sáng nay mà bạn cảm thấy giá như mình biết từ nối này thì câu nói sẽ thuyết phục hơn nhiều.',
      'Khi một từ vựng gắn liền với một tình huống cụ thể, việc ôn tập không còn là mở một bài học xa lạ. Nó là cơ hội để bạn quay lại ý tưởng quen thuộc và diễn đạt nó gãy gọn hơn một chút.',
      'Đó là lý do tính năng Context Capture của HeyMimic được xây dựng: bóc tách chính xác những cụm từ đắt giá từ những gì bạn đang sống cùng mỗi ngày.',
    ],
    pullQuote: '“Từ vựng không có ngữ cảnh giống như những viên gạch nằm rải rác. Chỉ khi có câu chuyện của bạn, chúng mới ghép thành ngôi nhà.”',
    keyTakeaways: [
      'Ngừng học thuộc lòng các bảng từ vựng tổng hợp không rõ mục đích sử dụng.',
      'Chủ động ghi nhận lại những từ bạn cảm thấy thiếu khi đang làm việc thực tế.',
      'Ứng dụng ngay từ mới vào buổi luyện nói 60 giây của ngày hôm sau.',
    ],
    author: {
      name: 'Minh Thảo',
      role: 'Product Designer & Language Explorer',
      initials: 'MT',
    },
  },
  {
    title: 'Vượt qua nỗi sợ bị phán xét khi mở mic nói tiếng Anh',
    slug: 'overcoming-speaking-anxiety',
    date: '15/08/2026',
    readingTime: '5 phút đọc',
    category: 'Tâm lý học',
    excerpt: 'Cách tạo dựng một không gian thực hành an toàn để tâm trí không bị khóa chặt bởi cảm giác sợ người khác chê cười.',
    content: [
      'Nỗi sợ lớn nhất khi học nói ngoại ngữ không nằm ở việc thiếu ngữ pháp, mà nằm ở nỗi lo bị người đối diện đánh giá. Mỗi khi chuẩn bị phát âm, não bộ tự động kích hoạt cơ chế phòng vệ: “Nếu mình phát âm sai từ này thì sao?”, “Họ có nghĩ tiếng Anh của mình kém không?”.',
      'Cảm giác này làm tê liệt khả năng tư duy ngôn ngữ. Bạn chọn giải pháp an toàn nhất: nói những câu cực ngắn, nói vòng vo hoặc đơn giản là im lặng gật đầu.',
      'Để tháo gỡ nút thắt tâm lý này, bạn cần một giai đoạn “luyện tập trong phòng kín”. Bạn cần một người lắng nghe có thể chỉ ra chỗ chưa tự nhiên nhưng hoàn toàn không mang định kiến hay cảm xúc phán xét.',
      'Khi luyện nói cùng AI tại HeyMimic, bạn hoàn toàn tự do thử nghiệm. Bạn có thể nói sai, ngập ngừng, bắt đầu lại 3 lần mà không sợ làm phiền hay xấu hổ. Chính sự an tâm đó giúp bạn rèn luyện phản xạ cho đến khi nó trở thành thói quen vững vàng ngoài đời thực.',
    ],
    pullQuote: '“Sự tự tin không xuất hiện trước khi bạn nói. Nó xuất hiện sau khi bạn đã dám nói sai hàng trăm lần trong một không gian an toàn.”',
    keyTakeaways: [
      'Chấp nhận ngập ngừng như một phần tự nhiên của quá trình nạp dữ liệu.',
      'Tập luyện với AI để xây dựng sự quen thuộc trước khi bước vào các cuộc họp quan trọng.',
      'Tập trung vào thông điệp cần truyền tải hơn là sự hoàn hảo từng âm tiết.',
    ],
    author: {
      name: 'Tuna',
      role: 'Creator of HeyMimic',
      initials: 'TN',
    },
  },
  {
    title: 'Nhật ký xây dựng HeyMimic: Một practice room tối giản',
    slug: 'building-heymimic-practice-room',
    date: '02/08/2026',
    readingTime: '3 phút đọc',
    category: 'Nhật ký phát triển',
    excerpt: 'Vì sao chúng mình loại bỏ tất cả các bảng xếp hạng, điểm thưởng hào nhoáng để giữ lại trải nghiệm học tập êm dịu nhất.',
    content: [
      'Khi bắt đầu thiết kế HeyMimic, có rất nhiều lời khuyên nên thêm vào các yếu tố gamification: bảng xếp hạng thi đua, âm thanh chúc mừng ồn ào, hoặc các huy hiệu cạnh tranh.',
      'Nhưng nhìn lại hành trình học của bản thân, chúng mình nhận thấy những thứ đó chỉ tạo ra sự hưng phấn ngắn hạn và nhanh chóng biến thành áp lực vô hình khi bạn lỡ quên một ngày. Người học tiếng Anh không cần thêm một trò chơi; họ cần một nơi chốn tĩnh lặng để tập trung vào giọng nói của mình.',
      'Chúng mình chọn phong cách thiết kế Warm Linen và Midnight Scholar với tông màu dịu mắt, chuyển động nhẹ nhàng và không gian thở rộng rãi. Mọi tính năng đều hướng tới việc: mở app lên là muốn bấm micro nói ngay mà không bị phân tâm bởi bất kỳ banner quảng cáo nào.',
    ],
    pullQuote: '“Một công cụ học tập tốt là công cụ biết lùi lại phía sau để nhường trọn vẹn sân khấu cho sự tiến bộ của người học.”',
    keyTakeaways: [
      'Tối giản hóa giao diện giúp giảm thiểu tải nhận thức (cognitive overload).',
      'Đo lường sự bền bỉ bằng số buổi luyện tập chất lượng thay vì điểm số ảo.',
      'Luôn lắng nghe phản hồi thực tế từ những người đang dùng app mỗi ngày.',
    ],
    author: {
      name: 'Tuna',
      role: 'Creator of HeyMimic',
      initials: 'TN',
    },
  },
]
