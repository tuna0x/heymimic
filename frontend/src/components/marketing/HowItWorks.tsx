import { ArrowUpRight, Mic2, RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  { number: '01', title: 'Chọn điều muốn nói', copy: 'Một chủ đề có liên quan đến hôm nay của bạn — không phải một đề bài xa lạ.', icon: Sparkles },
  { number: '02', title: 'Nói một lượt', copy: 'Bấm ghi âm và nói trong 60–90 giây. Có thể ngập ngừng, đó là dữ liệu.', icon: Mic2 },
  { number: '03', title: 'Nhận phản hồi', copy: 'Speaking Agent chỉ ra một vài điểm đáng sửa, kèm cách nói tự nhiên hơn.', icon: ArrowUpRight },
  { number: '04', title: 'Ôn lại đúng chỗ', copy: 'Những từ và lỗi lặp lại quay về đúng lúc để bạn thử thêm một lần nữa.', icon: RotateCcw },
]

export function HowItWorks() {
  return <section className="how-section" id="how-it-works"><div className="how-heading"><span className="marketing-kicker">THE PRACTICE LOOP</span><h2>Một vòng lặp nhỏ.<br /><em>Một giọng nói rõ hơn.</em></h2></div><div className="steps-grid">{steps.map(({ number, title, copy, icon: Icon }) => <article className="step-item" key={number}><div className="step-number">{number}<Icon size={16} /></div><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="how-bottom"><span>Không có bài kiểm tra đầu vào.<br />Chỉ có câu tiếp theo.</span><Link to="/signup">Thử practice room <ArrowUpRight size={16} /></Link></div></section>
}
