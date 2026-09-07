import type { SpeakingSession, SpeakingTopic } from '../type'

export const speakingTopics: SpeakingTopic[] = [
  {
    id: 'work-standup',
    category: 'work',
    categoryLabel: 'Công sở & Họp nhóm',
    title: 'Cập nhật tiến độ dự án (Sprint Standup)',
    level: 'B1-B2',
    prompt: 'Chia sẻ ngắn gọn: Hôm qua bạn đã làm gì, hôm nay dự định làm gì, và có điều gì đang gặp khó khăn (blocker) không.',
    contextDesc: 'Tình huống 60 giây kinh điển trong môi trường làm việc quốc tế. Tránh kể lể dài dòng, tập trung vào kết quả cụ thể và từ nối mượt mà.',
    starterSentence: 'Yesterday, I mainly focused on wrapping up the user authentication flow...',
    outline: [
      '1. Kết quả chính đã hoàn thành hôm qua (1-2 câu ngắn)',
      '2. Nhiệm vụ trọng tâm sẽ giải quyết trong hôm nay',
      '3. Rào cản hoặc ai bạn cần hỗ trợ để thông luồng',
    ],
    keyVocab: [
      { word: 'wrap up', meaning: 'hoàn tất, gói gọn công việc' },
      { word: 'blocker', meaning: 'vấn đề cản trở tiến độ' },
      { word: 'sync up with', meaning: 'họp nhanh/đồng bộ với ai đó' },
    ],
    modelAnswer:
      "Yesterday, I mainly focused on wrapping up the authentication flow and testing the edge cases. Today, my primary goal is to integrate the payment webhook, though I might need a quick five-minute sync with the backend team regarding the payload format. Other than that, no major blockers on my side.",
    mockResult: {
      score: 86,
      fluencyScore: 88,
      wpm: 126,
      cadenceScore: 89,
      vocabScore: 82,
      userTranscript:
        "Yesterday I worked on... uh... authentication. It was a bit hard with errors but now it works. Today I will do payment integration. I need to talk with backend team about format. No blockers for me.",
      feedback: [
        {
          id: 'f1',
          category: 'grammar',
          label: 'Nối từ & Trôi chảy',
          original: 'I worked on... uh... authentication',
          improved: 'I mainly focused on wrapping up the authentication flow',
          note: 'Thay vì dùng "worked on" chung chung kèm từ đệm, dùng cụm "focused on wrapping up" thể hiện rõ bạn đã làm xong.',
        },
        {
          id: 'f2',
          category: 'vocabulary',
          label: 'Từ vựng công sở',
          original: 'I need to talk with backend team',
          improved: 'I might need a quick five-minute sync with the backend team',
          note: '"A quick sync with" là cách diễn đạt phổ biến và chuyên nghiệp trong các buổi họp ngắn Agile/Scrum.',
        },
        {
          id: 'f3',
          category: 'suggestion',
          label: 'Ngữ điệu kết câu',
          original: 'No blockers for me.',
          improved: 'Other than that, no major blockers on my side.',
          note: 'Cách kết câu lịch sự, có nhịp điệu hạ giọng dứt khoát tự nhiên của người bản ngữ.',
        },
      ],
      rephrases: [
        {
          original: 'It was a bit hard with errors but now it works.',
          native: 'We ran into a few edge-case errors, but they are all sorted out now.',
          explanation: 'Dùng "edge-case errors" và "sorted out" giúp câu nói tự nhiên và toát lên phong thái chuyên nghiệp.',
        },
        {
          original: 'Today I will do payment integration.',
          native: 'My primary goal today is to tackle the payment integration.',
          explanation: 'Dùng "primary goal is to tackle" tạo cảm giác chủ động và rõ ràng mục tiêu.',
        },
      ],
    },
  },
  {
    id: 'job-interview',
    category: 'interview',
    categoryLabel: 'Phỏng vấn xin việc',
    title: 'Giới thiệu bản thân & Thế mạnh (Tell Me About Yourself)',
    level: 'B1-B2',
    prompt: 'Nêu bật kinh nghiệm chuyên môn, một thế mạnh cốt lõi và lý do bạn đam mê lĩnh vực hiện tại trong 60–90 giây.',
    contextDesc: 'Câu hỏi mở đầu quyết định 80% ấn tượng đầu tiên. Nguyên tắc: Quá khứ ngắn gọn → Hiện tại vững vàng → Hướng đến tương lai.',
    starterSentence: 'I have spent the past three years developing web products, with a strong emphasis on...',
    outline: [
      '1. Định vị chuyên môn ngắn gọn (Current role & domain)',
      '2. Thế mạnh hoặc điểm độc đáo của bạn (Core strength with example)',
      '3. Động lực hướng đến thử thách tiếp theo',
    ],
    keyVocab: [
      { word: 'hands-on experience', meaning: 'kinh nghiệm thực chiến' },
      { word: 'cross-functional', meaning: 'liên phòng ban/đa chuyên môn' },
      { word: 'thrive on', meaning: 'rất hào hứng và phát triển tốt khi gặp...' },
    ],
    modelAnswer:
      "Over the past few years, I've specialized in building clean, responsive web interfaces with a strong emphasis on user experience. What drives me most is collaborating closely with product designers to bridge the gap between design vision and technical execution. I thrive on solving messy, ambiguous user problems and turning them into seamless workflows.",
    mockResult: {
      score: 82,
      fluencyScore: 84,
      wpm: 118,
      cadenceScore: 81,
      vocabScore: 85,
      userTranscript:
        "Hello, I am a frontend developer for three years. I like to work with designers and make good UI. I always try to make code clean and easy to use for customers. I am looking for a new opportunity to learn more.",
      feedback: [
        {
          id: 'f1',
          category: 'vocabulary',
          label: 'Mở đầu ấn tượng',
          original: 'I am a frontend developer for three years',
          improved: "Over the past few years, I've specialized in building web interfaces",
          note: 'Dùng "specialized in" nâng tầm năng lực thay vì chỉ tự nhận vị trí cơ bản.',
        },
        {
          id: 'f2',
          category: 'suggestion',
          label: 'Diễn đạt thế mạnh',
          original: 'I like to work with designers',
          improved: 'What drives me most is collaborating closely with designers',
          note: '"What drives me most is..." thể hiện đam mê và tinh thần đồng đội sâu sắc hơn.',
        },
      ],
      rephrases: [
        {
          original: 'I always try to make code clean and easy to use.',
          native: 'I bridge the gap between design vision and intuitive user experience.',
          explanation: '"Bridge the gap" là thành ngữ đắt giá trong phỏng vấn công nghệ.',
        },
      ],
    },
  },
  {
    id: 'casual-coffee',
    category: 'casual',
    categoryLabel: 'Giao tiếp đời thường',
    title: 'Kể về một thói quen nhỏ tạo nên khác biệt',
    level: 'A2-B1',
    prompt: 'Kể về một thói quen đơn giản hàng ngày giúp bạn cảm thấy tỉnh táo hoặc làm việc hiệu quả hơn.',
    contextDesc: 'Chủ đề lý tưởng để luyện giọng kể chuyện (storytelling) ấm áp, tự nhiên, nhịp điệu thong thả không gượng gạo.',
    starterSentence: 'A few months ago, I decided to stop checking my phone the moment I wake up...',
    outline: [
      '1. Thói quen đó là gì và bạn bắt đầu khi nào',
      '2. Cảm giác lúc đầu (có khó khăn/lạ lẫm không)',
      '3. Thay đổi tích cực mà bạn nhận thấy sau vài tuần',
    ],
    keyVocab: [
      { word: 'game changer', meaning: 'bước ngoặt thay đổi hoàn toàn cục diện' },
      { word: 'clear-headed', meaning: 'tỉnh táo, đầu óc thông suốt' },
      { word: 'stick with', meaning: 'kiên trì duy trì điều gì đó' },
    ],
    modelAnswer:
      "A few months ago, I started a simple rule: no phone screens for the first twenty minutes of the morning. At first, it felt almost uncomfortable because reaching for my phone had become muscle memory. But after sticking with it for just two weeks, I noticed I was entering my workday feeling noticeably calmer and more clear-headed.",
    mockResult: {
      score: 79,
      fluencyScore: 80,
      wpm: 112,
      cadenceScore: 78,
      vocabScore: 80,
      userTranscript:
        "I started writing down three priorities every morning. At first, it felt a little unnecessary, but after a few weeks I noticed that I was less overwhelmed and more clear about what I wanted to do. It is a small habit, but it really changed the way I start my day.",
      feedback: [
        {
          id: 'f1',
          category: 'grammar',
          label: 'So sánh hơn tự nhiên',
          original: 'more clear about what I wanted to do',
          improved: 'clearer about what I wanted to accomplish',
          note: 'Dùng tính từ so sánh ngắn "clearer" và động từ hành động "accomplish" tạo cảm giác tự nhiên và dứt khoát hơn.',
        },
        {
          id: 'f2',
          category: 'vocabulary',
          label: 'Từ vựng sắc thái',
          original: 'it felt a little unnecessary',
          improved: 'it felt almost like a waste of time initially',
          note: 'Cách nói hội thoại tự nhiên của người bản ngữ khi diễn tả cảm giác ngần ngại ban đầu.',
        },
      ],
      rephrases: [
        {
          original: 'It is a small habit, but it really changed the way I start my day.',
          native: 'It may seem like a tiny tweak, but it has completely transformed my mornings.',
          explanation: '"Tiny tweak" và "transformed" tạo sự tương phản giàu tính biểu cảm.',
        },
      ],
    },
  },
  {
    id: 'tech-opinion',
    category: 'opinion',
    categoryLabel: 'Bày tỏ quan điểm',
    title: 'Làm việc từ xa (Remote Work) vs Đến văn phòng',
    level: 'B2+',
    prompt: 'Bạn thích mô hình làm việc từ xa hoàn toàn, kết hợp (hybrid) hay làm tại văn phòng? Nêu 2 lý do then chốt.',
    contextDesc: 'Luyện tập cấu trúc đưa quan điểm phản biện (Pros vs Cons) và kết luận thuyết phục.',
    starterSentence: 'In my view, while remote work offers unmatched flexibility, the hybrid model...',
    outline: [
      '1. Khẳng định quan điểm của bạn (Direct stance)',
      '2. Luận điểm ủng hộ: Sự tập trung sâu (Deep work) hoặc Kết nối đồng đội',
      '3. Nhìn nhận mặt hạn chế và đưa ra kết luận cân bằng',
    ],
    keyVocab: [
      { word: 'unmatched flexibility', meaning: 'sự linh hoạt không gì sánh bằng' },
      { word: 'strike a balance', meaning: 'tìm được điểm cân bằng hợp lý' },
      { word: 'spontaneous conversation', meaning: 'cuộc trò chuyện ngẫu hứng, tự nhiên' },
    ],
    modelAnswer:
      "In my view, while fully remote work offers unmatched flexibility for deep, uninterrupted work, the hybrid model strikes the best balance. Being in the office a couple of days a week enables spontaneous hallway conversations that often spark creative breakthroughs, while working from home allows for focused execution.",
    mockResult: {
      score: 88,
      fluencyScore: 89,
      wpm: 132,
      cadenceScore: 87,
      vocabScore: 91,
      userTranscript:
        "Personally, I prefer hybrid work. When I stay home, I can focus very well without noise. But when I go to office, I can meet colleagues and talk directly. I think two days at office is the best balance.",
      feedback: [
        {
          id: 'f1',
          category: 'vocabulary',
          label: 'Cụm từ đắt giá',
          original: 'focus very well without noise',
          improved: 'enjoy uninterrupted focus for deep work',
          note: 'Dùng cụm "uninterrupted focus" và "deep work" để nâng cao tính học thuật và chuyên nghiệp.',
        },
        {
          id: 'f2',
          category: 'suggestion',
          label: 'Cấu trúc kết luận',
          original: 'two days at office is the best balance',
          improved: 'striking that two-day balance gives the best of both worlds',
          note: '"Best of both worlds" là thành ngữ bản ngữ rất hay dùng khi nói về mô hình hybrid.',
        },
      ],
      rephrases: [
        {
          original: 'When I go to office, I can meet colleagues and talk directly.',
          native: 'Being on-site fosters spontaneous collaboration and builds stronger trust.',
          explanation: '"On-site" và "spontaneous collaboration" giúp luận điểm sắc sảo hơn.',
        },
      ],
    },
  },
]

// Fallback compatibility with existing code
export const todayPrompt = {
  eyebrow: 'SPEAKING AGENT · CÔNG SỞ & GIAO TIẾP',
  title: speakingTopics[0].title,
  description: speakingTopics[0].prompt,
  time: '60–90 SEC',
}

export const latestSession: SpeakingSession = {
  id: 'session-04',
  topicId: speakingTopics[0].id,
  title: speakingTopics[0].title,
  prompt: speakingTopics[0].prompt,
  duration: '01:18',
  date: 'Hôm nay, 09:42',
  score: speakingTopics[0].mockResult.score,
  transcript: speakingTopics[0].mockResult.userTranscript,
  feedback: speakingTopics[0].mockResult.feedback,
  attempts: [
    {
      id: 'att-01',
      speakingSessionId: 'session-04',
      attemptNumber: 1,
      durationSeconds: 78,
      audioAvailability: 'inSession',
      createdAt: '09:42',
    },
  ],
}

export const recentSessions: SpeakingSession[] = [
  latestSession,
  {
    id: 'session-03',
    topicId: speakingTopics[1].id,
    title: speakingTopics[1].title,
    prompt: speakingTopics[1].prompt,
    duration: '01:12',
    date: 'Hôm qua, 20:16',
    score: 82,
    transcript: speakingTopics[1].mockResult.userTranscript,
    feedback: speakingTopics[1].mockResult.feedback,
    attempts: [
      {
        id: 'att-02',
        speakingSessionId: 'session-03',
        attemptNumber: 1,
        durationSeconds: 72,
        audioAvailability: 'unavailable',
        createdAt: '20:16',
      },
    ],
  },
  {
    id: 'session-02',
    topicId: speakingTopics[2].id,
    title: speakingTopics[2].title,
    prompt: speakingTopics[2].prompt,
    duration: '01:05',
    date: '02/09/2026',
    score: 79,
    transcript: speakingTopics[2].mockResult.userTranscript,
    feedback: speakingTopics[2].mockResult.feedback,
    attempts: [
      {
        id: 'att-03',
        speakingSessionId: 'session-02',
        attemptNumber: 1,
        durationSeconds: 65,
        audioAvailability: 'unavailable',
        createdAt: '15:30',
      },
    ],
  },
]

