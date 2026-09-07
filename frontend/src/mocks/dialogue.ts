import type { DialogueScenario } from '../type'

export const dialogueScenarios: DialogueScenario[] = [
  {
    id: 'roleplay-deadline',
    title: 'Thương Lượng Lùi Deadline Kỹ Thuật',
    category: 'work',
    role: 'Lead Developer / Engineer',
    aiRole: 'Project Manager (Sarah)',
    objective: 'Giải thích nguyên nhân sự cố và thuyết phục PM đồng ý dời lịch phát hành thêm 2 ngày mà vẫn giữ được sự tin cậy.',
    contextDesc:
      'Đợt kiểm thử hiệu năng tối qua phát hiện lỗi rò rỉ bộ nhớ (memory leak). Nếu ra mắt đúng thứ Sáu, hệ thống có nguy cơ sập. Bạn cần xin dời sang thứ Hai.',
    metricsSummary: {
      politenessScore: 92,
      clarityScore: 88,
      naturalnessScore: 90,
    },
    turns: [
      {
        id: 'turn-1',
        speaker: 'ai',
        speakerName: 'Sarah (Project Manager)',
        text: "Hi Alex! I saw your message about the load test results. Are we still on track to deploy the new checkout flow this Friday morning?",
        feedbackNote: 'Lời mở đầu của PM mang tính trực diện. Bạn cần thừa nhận tình hình trước, tránh nói vòng vo.',
      },
      {
        id: 'turn-2',
        speaker: 'user',
        speakerName: 'Bạn (Alex)',
        text: "To be completely transparent, we ran into a memory leak during load testing yesterday. If we release on Friday, we risk severe downtime during peak hours.",
        suggestedRephrase:
          "To give you an honest update, we uncovered an edge-case memory leak yesterday. Deploying on Friday carries a high risk of downtime during peak traffic.",
        feedbackNote: 'Rất tốt! Cụm "To be completely transparent" tạo cảm giác tin cậy và chuyên nghiệp.',
      },
      {
        id: 'turn-3',
        speaker: 'ai',
        speakerName: 'Sarah (Project Manager)',
        text: "That sounds concerning. The marketing campaign is scheduled for Monday. What is your proposed plan to minimize customer impact?",
        feedbackNote: 'PM đang lo lắng về chiến dịch marketing. Hãy đưa ra mốc thời gian rõ ràng và phương án kiểm thử lại.',
      },
      {
        id: 'turn-4',
        speaker: 'user',
        speakerName: 'Bạn (Alex)',
        text: "We recommend pushing back the deployment to Monday morning at 6 AM. We will patch the bug today and run full validation over the weekend.",
        suggestedRephrase:
          "We suggest pushing back the launch to Monday at 6 AM. This gives us enough buffer to patch the root cause today and stress-test the fix over the weekend.",
        feedbackNote: 'Rất thuyết phục! Việc đưa ra cam kết kiểm thử cuối tuần giúp PM an tâm.',
      },
      {
        id: 'turn-5',
        speaker: 'ai',
        speakerName: 'Sarah (Project Manager)',
        text: "Understood. That sounds like a solid mitigation plan. I'll notify the stakeholders about the Monday morning schedule. Keep me posted on Slack.",
        feedbackNote: 'Mục tiêu hoàn thành! Bạn đã thuyết phục thành công PM lùi lịch an toàn.',
      },
    ],
  },
  {
    id: 'roleplay-interview',
    title: 'Trả Lời Về Sự Bất Đồng Ý Kiến Với Đồng Nghiệp',
    category: 'interview',
    role: 'Ứng viên (Candidate)',
    aiRole: 'Hiring Manager (David)',
    objective: 'Thể hiện tư duy hướng tới giải pháp (solution-oriented) và tinh thần cộng tác khi có bất đồng kỹ thuật.',
    contextDesc:
      'Nhà tuyển dụng muốn kiểm tra kỹ năng mềm và khả năng giải quyết xung đột khi bạn và đồng nghiệp có quan điểm thiết kế kiến trúc trái ngược.',
    metricsSummary: {
      politenessScore: 95,
      clarityScore: 90,
      naturalnessScore: 92,
    },
    turns: [
      {
        id: 'iturn-1',
        speaker: 'ai',
        speakerName: 'David (Hiring Manager)',
        text: "Could you tell me about a time when you strongly disagreed with a teammate on a technical decision? How did you handle that?",
        feedbackNote: 'Câu hỏi hành vi kinh điển. Hãy áp dụng cấu trúc: Bối cảnh → Bất đồng gì → Giải pháp tôn trọng → Kết quả khách quan.',
      },
      {
        id: 'iturn-2',
        speaker: 'user',
        speakerName: 'Bạn (Ứng viên)',
        text: "On my last project, my colleague wanted to rewrite everything in GraphQL, while I believed optimizing our REST endpoints was much safer for our tight timeline.",
        suggestedRephrase:
          "In my previous role, a teammate proposed rewriting our API in GraphQL, whereas I felt optimizing our existing REST endpoints was significantly less risky given our timeline.",
        feedbackNote: 'Nêu rõ ràng 2 quan điểm mà không phán xét đối phương.',
      },
      {
        id: 'iturn-3',
        speaker: 'ai',
        speakerName: 'David (Hiring Manager)',
        text: "Interesting. How did you both reach a consensus without creating friction within the team?",
        feedbackNote: 'Nhà tuyển dụng muốn thấy cách bạn dùng số liệu và thử nghiệm thực tế (benchmark) thay vì cảm tính.',
      },
      {
        id: 'iturn-4',
        speaker: 'user',
        speakerName: 'Bạn (Ứng viên)',
        text: "Instead of arguing, we set up a one-day proof of concept to benchmark both approaches. The data showed REST met all our latency requirements with zero migration overhead.",
        suggestedRephrase:
          "Instead of debating endlessly, we agreed to build a one-day prototype and run latency benchmarks. The numbers clearly showed REST satisfied our requirements with minimal overhead.",
        feedbackNote: 'Câu trả lời xuất sắc! "One-day proof of concept" là từ khóa ghi điểm lớn trong mắt các tech lead.',
      },
      {
        id: 'iturn-5',
        speaker: 'ai',
        speakerName: 'David (Hiring Manager)',
        text: "I really like that data-driven mindset. Focusing on business impact rather than personal preferences is essential here.",
        feedbackNote: 'Bạn đã tạo được ấn tượng chuyên nghiệp và chững chạc.',
      },
    ],
  },
]
