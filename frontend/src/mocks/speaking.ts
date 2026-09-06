import type { SpeakingSession } from '../type'

export const todayPrompt = {
  eyebrow: 'SPEAKING AGENT · SESSION 04',
  title: 'A small change\nthat made a difference',
  description: 'Kể về một thay đổi nhỏ trong thói quen đã tạo ra tác động lớn. Nói trong 60–90 giây, không cần chuẩn bị trước.',
  time: '60–90 SEC',
}

export const latestSession: SpeakingSession = {
  id: 'session-04',
  title: 'A small change that made a difference',
  prompt: 'Talk about a small change in your routine that made a meaningful difference.',
  duration: '01:18', date: 'Hôm nay, 09:42', score: 78,
  transcript: 'I started writing down three things every morning. At first, it felt a little unnecessary, but after a few weeks I noticed that I was less overwhelmed and more clear about what I wanted to do. It is a small habit, but it really changed the way I start my day.',
  feedback: [
    { id: 'f1', category: 'grammar', label: 'Ngữ pháp', original: 'more clear about what I wanted to do', improved: 'clearer about what I wanted to do', note: 'Dùng dạng so sánh ngắn “clearer” sẽ tự nhiên hơn trong câu này.' },
    { id: 'f2', category: 'vocabulary', label: 'Từ vựng', original: 'a little unnecessary', improved: 'a bit pointless', note: '“A bit pointless” tạo sắc thái hội thoại, tự nhiên hơn trong ngữ cảnh này.' },
    { id: 'f3', category: 'suggestion', label: 'Gợi ý', original: 'It is a small habit, but it really changed…', improved: 'It may seem small, but it has completely changed…', note: 'Thử dùng cấu trúc này để nhấn mạnh tác động kéo dài đến hiện tại.' },
  ],
}

export const recentSessions: SpeakingSession[] = [
  latestSession,
  { id: 'session-03', title: 'A place I return to', prompt: 'Describe a place that helps you reset.', duration: '00:54', date: 'Hôm qua, 20:16', score: 72, transcript: 'There is a small coffee shop near my apartment...', feedback: [] },
  { id: 'session-02', title: 'Explain your work simply', prompt: 'Explain what you do to a curious child.', duration: '01:07', date: '02/09/2026', score: 81, transcript: 'I help teams make sense of complicated ideas...', feedback: [] },
]
