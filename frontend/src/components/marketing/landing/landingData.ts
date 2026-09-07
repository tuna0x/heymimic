export interface Scenario {
  id: string
  titleVi: string
  titleEn: string
  prompt: string
  hesitantText: string
  nativeWords: Array<{ word: string; stress?: boolean; pauseAfter?: boolean }>
  diffExplanation: string
  aiFeedback: string
  scoreBefore: number
  scoreAfter: number
}

export const scenarios: Scenario[] = [
  {
    id: 'standup',
    titleVi: 'Cập nhật tiến độ họp Daily',
    titleEn: 'Daily Standup Sync',
    prompt: 'Chia sẻ ngắn về tính năng bạn hoàn thành hôm qua và việc sẽ làm hôm nay.',
    hesitantText: 'Yesterday I finished the auth API and I was more clear about the contract. Today I tackle dashboard.',
    nativeWords: [
      { word: 'Yesterday' },
      { word: 'I' },
      { word: 'wrapped up', stress: true },
      { word: 'the auth API,', pauseAfter: true },
      { word: 'and gained' },
      { word: 'complete clarity', stress: true },
      { word: 'on the contract.', pauseAfter: true },
      { word: 'Today' },
      { word: 'I’m diving into', stress: true },
      { word: 'the dashboard widgets.' },
    ],
    diffExplanation: 'Dùng “wrapped up” và “gained complete clarity” giúp câu nói dứt khoát và tự nhiên hơn “more clear”.',
    aiFeedback: 'Tập trung nhấn vào trọng âm của “clarity” và giữ nhịp nói đều giữa hai câu.',
    scoreBefore: 68,
    scoreAfter: 94,
  },
  {
    id: 'meeting',
    titleVi: 'Bày tỏ quan điểm trong cuộc họp',
    titleEn: 'Constructive Feedback',
    prompt: 'Nêu góc nhìn thận trọng về lịch ra mắt sản phẩm mà không làm mất hòa khí.',
    hesitantText: 'In my opinion, launching next week is not a good idea because QA is not ready.',
    nativeWords: [
      { word: 'From where I sit,', stress: true, pauseAfter: true },
      { word: 'launching' },
      { word: 'next week' },
      { word: 'might be', stress: true },
      { word: 'counterproductive', stress: true, pauseAfter: true },
      { word: 'until QA' },
      { word: 'signs off on', stress: true },
      { word: 'the core flows.' },
    ],
    diffExplanation: 'Thay vì nói trực diện “not a good idea”, dùng “might be counterproductive” giúp giữ không khí thảo luận cởi mở.',
    aiFeedback: 'Cách dùng “from where I sit” tạo cảm giác khiêm tốn và tôn trọng góc nhìn của đồng nghiệp.',
    scoreBefore: 72,
    scoreAfter: 96,
  },
  {
    id: 'smalltalk',
    titleVi: 'Trò chuyện đầu tuần thư giãn',
    titleEn: 'Casual Monday Smalltalk',
    prompt: 'Kể lại hoạt động cuối tuần giúp bạn nạp năng lượng và hỏi thăm đồng nghiệp.',
    hesitantText: 'I just stayed at home and took rest. It was very good for me.',
    nativeWords: [
      { word: 'I' },
      { word: 'laid low', stress: true },
      { word: 'over the weekend' },
      { word: 'to recharge—', stress: true, pauseAfter: true },
      { word: 'honestly' },
      { word: 'just what I needed', stress: true },
      { word: 'before a busy sprint.', pauseAfter: true },
      { word: 'How did yours go?', stress: true },
    ],
    diffExplanation: '“Laid low to recharge” và “just what I needed” tự nhiên và ấm áp hơn hẳn câu miêu tả chung chung.',
    aiFeedback: 'Nâng nhẹ ngữ điệu ở câu hỏi cuối “How did yours go?” để mở lời thân mật.',
    scoreBefore: 65,
    scoreAfter: 92,
  },
]

export const loopSteps = [
  {
    num: '01',
    title: 'Chọn điều muốn nói',
    desc: 'Một chủ đề gắn liền với hôm nay của bạn: một tình huống công việc, một bài báo vừa đọc, hoặc cảm xúc đời thường.',
  },
  {
    num: '02',
    title: 'Nói 60–90 giây thành tiếng',
    desc: 'Mở micro và nói tự nhiên. Bạn có thể ngập ngừng hay dừng lại suy nghĩ, mọi điểm vấp đều là dữ liệu để tiến bộ.',
  },
  {
    num: '03',
    title: 'Nhận phản hồi tức thì',
    desc: 'AI chỉ ra các lỗi ngữ pháp nhỏ và đưa ra phiên bản diễn đạt tự nhiên chuẩn bản xứ hơn, không phán xét.',
  },
  {
    num: '04',
    title: 'Ôn lại đúng điểm vấp',
    desc: 'Từ vựng và các lỗi phát âm lặp lại sẽ quay lại đúng lúc qua thuật toán lặp lại ngắt quãng (SRS).',
  },
]

export const comparisonData = [
  {
    feature: 'Cách tiếp cận phản xạ',
    heymimic: 'Mở mic nói 60–90 giây mỗi ngày trong ngữ cảnh thật',
    traditional: 'Bấm chọn trắc nghiệm, ghép chữ trên màn hình',
    tutor: 'Nói 45–60 phút/buổi, dễ mệt mỏi và áp lực',
  },
  {
    feature: 'Áp lực tâm lý & Sợ sai',
    heymimic: '100% riêng tư với AI, không ai phán xét hay chê cười',
    traditional: 'Không có áp lực nhưng không rèn luyện được cơ miệng',
    tutor: 'Dễ ngại ngùng nếu phát âm chưa chuẩn',
  },
  {
    feature: 'Nguồn gốc từ vựng',
    heymimic: 'Bóc tách từ email, bài báo, tài liệu bạn thật sự đọc',
    traditional: 'Danh sách từ học vẹt cố định theo giáo trình',
    tutor: 'Phụ thuộc vào giáo án của từng giáo viên',
  },
  {
    feature: 'Theo dõi điểm vấp quen thuộc',
    heymimic: 'Thống kê xu hướng nuốt âm /s/, /t/ hay quên mạo từ',
    traditional: 'Chỉ chấm Đúng/Sai từng câu riêng lẻ',
    tutor: 'Sửa lỗi ngẫu nhiên, khó đo lường tiến bộ dài hạn',
  },
  {
    feature: 'Thời gian & Sự tiện lợi',
    heymimic: '10–15 phút mỗi ngày, tự chủ hoàn toàn thời gian',
    traditional: 'Tiện lợi nhưng tỷ lệ bỏ dở cao vì không nói được',
    tutor: 'Cần đặt lịch cố định, chi phí đắt đỏ',
  },
]

export const testimonials = [
  {
    name: 'Hoàng Nam',
    role: 'Senior Software Engineer',
    quote:
      'Trước các buổi họp Scrum với đội ngũ nước ngoài, mình hay bị khựng lại để dịch từng câu. Dùng HeyMimic luyện thử 2 phút mỗi sáng giúp mình quen với nhịp điệu và nói trôi chảy hơn hẳn.',
    streak: 'Streak 28 ngày',
  },
  {
    name: 'Minh Thảo',
    role: 'Product Designer',
    quote:
      'Mình thích nhất sự êm dịu của HeyMimic. Không có bảng xếp hạng ồn ào, chỉ có AI lắng nghe riêng tư và gợi ý cách người bản xứ hay diễn đạt. Thiết kế rất thanh lịch, không gây mỏi mắt.',
    streak: '44 buổi luyện nói',
  },
  {
    name: 'Tuấn Anh',
    role: 'Marketing Lead',
    quote:
      'Tính năng dán một đoạn văn tiếng Anh để AI bóc tách cụm từ đắt giá giúp mình tiết kiệm rất nhiều thời gian. Học đúng từ mình cần dùng trong công việc chiều hôm đó.',
    streak: '120 từ ngữ cảnh',
  },
]

export const faqs = [
  {
    q: 'HeyMimic khác gì so với các ứng dụng học tiếng Anh thông thường?',
    a: 'Phần lớn các app hiện nay chỉ tập trung vào việc bấm trắc nghiệm hoặc xem video thụ động. HeyMimic xây dựng xung quanh phản xạ cốt lõi: bạn bắt buộc phải mở mic nói thành tiếng 60–90 giây mỗi ngày. AI đóng vai trò người lắng nghe riêng tư, ghi nhận điểm ngập ngừng và gợi ý cách diễn đạt tự nhiên hơn mà không tạo áp lực.',
  },
  {
    q: 'Tôi phát âm chưa tốt và hay ngập ngừng thì có dùng được không?',
    a: 'Chính xác vì bạn hay ngập ngừng nên HeyMimic sinh ra để dành cho bạn! Bạn đang luyện tập với AI trong không gian 100% riêng tư, không có ai phán xét hay chê cười. Càng nói sai nhiều thì AI càng hiểu các mẫu vấp của bạn để giúp bạn gỡ dần từng nút thắt.',
  },
  {
    q: 'Mỗi ngày tôi cần dành bao nhiêu thời gian?',
    a: 'Chỉ cần từ 10 đến 15 phút mỗi ngày. 1 phút đọc ngữ cảnh, 90 giây nói thành tiếng, 2 phút xem phân tích và 5 phút ôn lại từ vựng. Tính nhất quán mỗi ngày quan trọng gấp 10 lần việc học dồn nhiều giờ vào cuối tuần.',
  },
  {
    q: 'Dữ liệu giọng nói của tôi có được bảo mật không?',
    a: 'Hoàn toàn bảo mật. Các đoạn ghi âm chỉ phục vụ cho việc phiên âm và phân tích ngữ pháp trong phiên học của bạn. HeyMimic không bao giờ chia sẻ hay thương mại hóa bản ghi âm của bạn cho bên thứ ba.',
  },
]
