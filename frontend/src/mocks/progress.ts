import type { CommonMistake, ProgressDay } from '../type'

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
  { id: 'm3', title: 'Âm cuối /s/ và /t/', detail: 'Âm cuối thường bị nuốt khi nói nhanh', count: 6, trend: '-24%', example: 'want /wɒnt/ · wants /wɒnts/' },
]
