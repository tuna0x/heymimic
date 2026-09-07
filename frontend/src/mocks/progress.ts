import type { CommonMistake, MistakePattern, ProgressDay } from '../type'

export const weeklyProgress: ProgressDay[] = [
  { day: 'T2', date: '01/09', minutes: 18, active: true },
  { day: 'T3', date: '02/09', minutes: 26, active: true },
  { day: 'T4', date: '03/09', minutes: 12, active: true },
  { day: 'T5', date: '04/09', minutes: 34, active: true },
  { day: 'T6', date: '05/09', minutes: 0, active: false },
  { day: 'T7', date: '06/09', minutes: 22, active: true },
  { day: 'CN', date: '07/09', minutes: 8, active: true },
]

export const commonMistakes: CommonMistake[] = [
  { id: 'm1', title: 'Mạo từ “a / the”', detail: 'Bỏ quên mạo từ trước danh từ số ít', count: 12, trend: '-18%', example: 'I started new habit → I started a new habit' },
  { id: 'm2', title: 'Thì hiện tại hoàn thành', detail: 'Dùng quá khứ đơn khi nói về trải nghiệm', count: 8, trend: '-11%', example: 'I live here since 2022 → I have lived here since 2022' },
  { id: 'm3', title: 'Cụm từ nối trong công việc', detail: 'Thiếu cụm từ diễn đạt tự nhiên khi cập nhật công việc', count: 6, trend: '-24%', example: 'I talk with team → I sync up with the team' },
]

export const initialMistakePatterns: MistakePattern[] = [
  {
    id: 'm1',
    category: 'grammar',
    title: 'Mạo từ “a / an / the”',
    explanation: 'Bỏ quên mạo từ xác định hoặc không xác định trước danh từ đếm được số ít (singular countable nouns). Trong tiếng Anh, danh từ đếm được số ít không bao giờ đứng độc lập.',
    status: 'needsPractice',
    count: 3,
    recommendedTopicId: 'job-interview',
    exampleSentence: 'I have started [a] new routine at work.',
    occurrences: [
      {
        id: 'occ-1',
        patternId: 'm1',
        speakingSessionId: 'session-04',
        sessionTitle: 'Cập nhật tiến độ dự án (Sprint Standup)',
        original: 'I need to talk with backend team about format.',
        suggested: 'I might need a quick sync with the backend team about the format.',
        occurredAt: 'Hôm nay, 09:42',
        source: 'Buổi luyện Sprint Standup',
      },
      {
        id: 'occ-2',
        patternId: 'm1',
        speakingSessionId: 'session-03',
        sessionTitle: 'Giới thiệu bản thân & Thế mạnh',
        original: 'I worked as frontend developer in company.',
        suggested: 'I worked as a frontend developer at a tech company.',
        occurredAt: 'Hôm qua, 20:16',
        source: 'Buổi luyện Phỏng vấn',
      },
      {
        id: 'occ-3',
        patternId: 'm1',
        speakingSessionId: 'session-02',
        sessionTitle: 'Bày tỏ quan điểm về Remote Work',
        original: 'It gives good balance between work and life.',
        suggested: 'It provides a healthy balance between work and personal life.',
        occurredAt: '02/09/2026',
        source: 'Buổi luyện Remote Work',
      },
    ],
  },
  {
    id: 'm2',
    category: 'grammar',
    title: 'Thì hiện tại hoàn thành vs Quá khứ đơn',
    explanation: 'Dùng quá khứ đơn (Past Simple) khi diễn tả hành động/trải nghiệm bắt đầu trong quá khứ và vẫn còn liên quan hoặc tiếp diễn đến hiện tại (Present Perfect).',
    status: 'improving',
    count: 2,
    recommendedTopicId: 'job-interview',
    exampleSentence: 'I have worked here for two years (not: I work / worked here for two years).',
    occurrences: [
      {
        id: 'occ-4',
        patternId: 'm2',
        speakingSessionId: 'session-03',
        sessionTitle: 'Giới thiệu bản thân & Thế mạnh',
        original: 'I worked in this field for three years until now.',
        suggested: 'I have been working in this field for three years.',
        occurredAt: 'Hôm qua, 20:16',
        source: 'Buổi luyện Phỏng vấn',
      },
      {
        id: 'occ-5',
        patternId: 'm2',
        speakingSessionId: 'session-04',
        sessionTitle: 'Cập nhật tiến độ dự án (Sprint Standup)',
        original: 'Yesterday I finish the bug and test it.',
        suggested: 'Yesterday I wrapped up the bug fix and tested it thoroughly.',
        occurredAt: 'Hôm nay, 09:42',
        source: 'Buổi luyện Sprint Standup',
      },
    ],
  },
  {
    id: 'm3',
    category: 'vocabulary',
    title: 'Cụm từ nối chuyên nghiệp (Collocations & Phrasal Verbs)',
    explanation: 'Sử dụng các động từ đơn lẻ và từ dịch thô thay vì dùng các cụm động từ tự nhiên được người bản xứ dùng hằng ngày trong môi trường Agile/Tech.',
    status: 'needsPractice',
    count: 2,
    recommendedTopicId: 'work-standup',
    exampleSentence: 'Let’s sync up for five minutes to wrap this up.',
    occurrences: [
      {
        id: 'occ-6',
        patternId: 'm3',
        speakingSessionId: 'session-04',
        sessionTitle: 'Cập nhật tiến độ dự án (Sprint Standup)',
        original: 'I need to talk with backend team.',
        suggested: 'I might need a quick five-minute sync with the backend team.',
        occurredAt: 'Hôm nay, 09:42',
        source: 'Buổi luyện Sprint Standup',
      },
    ],
  },
]

