import type { ReflexTranslationPrompt, WritingTemplate } from '../type'

export const writingTemplates: WritingTemplate[] = [
  {
    id: 'write-email-delay',
    title: 'Thông Báo Lùi Lịch Bàn Giao (Email & Slack)',
    category: 'email',
    categoryLabel: 'Email công việc',
    context: 'Bạn cần thông báo cho khách hàng hoặc sếp rằng tính năng sẽ bàn giao chậm 1 ngày do kiểm thử phát hiện lỗi.',
    sampleDraft:
      'Hello. I want to say that the project cannot finish today because we have many bug in the code. We will finish tomorrow. Sorry for the problem.',
    professionalVersion:
      'Dear David,\n\nI am writing to provide a quick update regarding the deliverables for this sprint. During our final staging tests this afternoon, our QA team identified a couple of edge-case bugs that require additional patching.\n\nTo ensure the release is completely stable, we recommend pushing back the deployment by 24 hours to tomorrow at 3 PM. We sincerely appreciate your patience and will keep you posted as soon as the final build passes verification.\n\nBest regards,\nAlex Trần',
    casualVersion:
      'Hey team, quick heads-up on the sprint progress. We caught a couple of minor edge cases in QA today, so we are going to hold off on deploying until tomorrow afternoon to make sure everything runs smoothly. Will keep everyone posted in the channel!',
    keyImprovements: [
      'Thay vì nói "many bug in the code", dùng "identified a couple of edge-case bugs that require patching" (chuyên nghiệp và đáng tin hơn).',
      'Thay vì "Sorry for the problem", dùng "We sincerely appreciate your patience" hoặc "Quick heads-up".',
      'Đưa ra mốc giờ cụ thể ("tomorrow at 3 PM") thay vì nói chung chung.',
    ],
  },
  {
    id: 'write-slack-question',
    title: 'Nhờ Đồng Nghiệp Review Code & Góp Ý (Slack/Teams)',
    category: 'slack',
    categoryLabel: 'Tin nhắn nội bộ',
    context: 'Bạn vừa tạo một Pull Request quan trọng và muốn nhờ một kỹ sư kỳ cựu xem qua giúp khi họ rảnh.',
    sampleDraft:
      'Hi Sarah, please check my code now. I create PR #124 and need you see it. Thank you.',
    professionalVersion:
      'Hi Sarah,\n\nWhenever you have a free moment today, could you please take a look at PR #124? It covers the refactoring of our user authentication service. I would really appreciate your feedback on the error-handling structure.\n\nNo urgent rush — thank you for your time!',
    casualVersion:
      'Hey Sarah! When you get a chance, could you give PR #124 a quick spin? Just wrapped up the auth refactor. Any thoughts on the error handling would be super helpful. Thanks a bunch!',
    keyImprovements: [
      'Thay vì ra lệnh "please check my code now", dùng "Whenever you have a free moment" hoặc "When you get a chance".',
      'Bổ sung tóm tắt PR giải quyết gì ("covers the refactoring of...") để người review nắm được ngữ cảnh ngay.',
      'Thêm câu giảm áp lực ("No urgent rush") thể hiện sự tôn trọng thời gian của đồng nghiệp.',
    ],
  },
]

export const reflexPrompts: ReflexTranslationPrompt[] = [
  {
    id: 'reflex-1',
    vietnameseThought: 'Để tôi kiểm tra lại với nhóm rồi báo lại cho bạn sau nhé.',
    context: 'Khi khách hàng hoặc đồng nghiệp hỏi một vấn đề mà bạn chưa nắm chắc số liệu ngay tại chỗ.',
    literalTrap: 'Let me check with team and tell you again later.',
    naturalEnglish: "Let me check with the team and get back to you shortly.",
    explanation:
      'Người bản xứ luôn dùng cụm cố định "get back to you" thay vì "tell you again" hoặc "answer you later". Thêm "shortly" giúp câu nói lịch sự và nhã nhặn hơn nhiều.',
    targetChunks: ['check with the team', 'get back to you shortly'],
  },
  {
    id: 'reflex-2',
    vietnameseThought: 'Chiều nay tôi bận kín lịch họp rồi, có gì bạn cứ nhắn tin nhé.',
    context: 'Từ chối một cuộc gọi đột xuất một cách khéo léo và gợi ý kênh liên lạc thay thế.',
    literalTrap: 'This afternoon I am full of meetings, you can message me.',
    naturalEnglish: "I'm tied up in meetings all afternoon, but feel free to drop me a message on Slack.",
    explanation:
      'Cụm "tied up in meetings" là cách nói bản xứ cực kỳ phổ biến để chỉ việc bị cuốn vào chuỗi cuộc họp. Vế sau dùng "feel free to drop me a message" nghe rất cởi mở và tự nhiên.',
    targetChunks: ['tied up in meetings', 'feel free to drop me a message'],
  },
  {
    id: 'reflex-3',
    vietnameseThought: 'Chúng ta nên lùi cuộc họp này lại cho đến khi có đủ dữ liệu.',
    context: 'Đề xuất hoãn cuộc thảo luận để tránh lãng phí thời gian khi chưa có kết quả kiểm thử.',
    literalTrap: 'We should delay this meeting until have enough data.',
    naturalEnglish: "We should probably hold off on this meeting until we have all the data in hand.",
    explanation:
      'Thêm từ giảm nhẹ "probably" và dùng cụm "hold off on something" giúp lời đề xuất có tính ngoại giao, không bị thô ráp hay áp đặt. "Data in hand" là cách diễn đạt tự nhiên cho việc đã nắm đủ số liệu.',
    targetChunks: ['hold off on this meeting', 'data in hand'],
  },
]
