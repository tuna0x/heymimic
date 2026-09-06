import type { VocabWord } from '../type'

// Mock shape mirrors the future Vocab Agent response.
export const todayWords: VocabWord[] = [
  {
    id: 'resilient', word: 'resilient', pronunciation: '/rɪˈzɪliənt/', meaning: 'kiên cường, có khả năng phục hồi',
    partOfSpeech: 'adjective', example: 'She is remarkably resilient in the face of change.', translation: 'Cô ấy rất kiên cường trước những thay đổi.',
    status: 'reviewing', mastery: 68, color: 'coral',
  },
  {
    id: 'nuance', word: 'nuance', pronunciation: '/ˈnuːɑːns/', meaning: 'sắc thái, nét tinh tế',
    partOfSpeech: 'noun', example: 'The meaning changes depending on the nuance of your tone.', translation: 'Ý nghĩa thay đổi tùy vào sắc thái giọng nói của bạn.',
    status: 'new', mastery: 20, color: 'cream',
  },
  {
    id: 'articulate', word: 'articulate', pronunciation: '/ɑːˈtɪkjələt/', meaning: 'diễn đạt rõ ràng',
    partOfSpeech: 'verb', example: 'Try to articulate one idea at a time.', translation: 'Hãy thử diễn đạt từng ý một cách rõ ràng.',
    status: 'reviewing', mastery: 52, color: 'teal',
  },
  {
    id: 'hesitate', word: 'hesitate', pronunciation: '/ˈhezɪteɪt/', meaning: 'do dự, ngập ngừng',
    partOfSpeech: 'verb', example: 'Don’t hesitate to ask for a second chance.', translation: 'Đừng ngần ngại xin thêm một cơ hội.',
    status: 'mastered', mastery: 91, color: 'cream',
  },
  {
    id: 'concise', word: 'concise', pronunciation: '/kənˈsaɪs/', meaning: 'ngắn gọn, súc tích',
    partOfSpeech: 'adjective', example: 'Keep your answer concise and specific.', translation: 'Hãy giữ câu trả lời ngắn gọn và cụ thể.',
    status: 'new', mastery: 12, color: 'coral',
  },
  {
    id: 'intonation', word: 'intonation', pronunciation: '/ˌɪntəˈneɪʃən/', meaning: 'ngữ điệu',
    partOfSpeech: 'noun', example: 'Natural intonation makes your English easier to follow.', translation: 'Ngữ điệu tự nhiên giúp tiếng Anh của bạn dễ theo dõi hơn.',
    status: 'reviewing', mastery: 44, color: 'teal',
  },
]

export const extractedWords = [
  { word: 'follow through', meaning: 'làm đến cùng', context: '“I want to follow through on this idea.”' },
  { word: 'overwhelm', meaning: 'làm choáng ngợp', context: '“The details can overwhelm you at first.”' },
  { word: 'steady', meaning: 'ổn định, đều đặn', context: '“A steady practice is better than a perfect plan.”' },
]
