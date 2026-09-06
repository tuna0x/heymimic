import { ArrowUpRight, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Pillar {
  index: string
  title: string
  description: string
  kind: 'vocab' | 'speaking' | 'progress'
}

const pillars: Pillar[] = [
  { index: '01', title: 'Vocab của bạn', description: 'Từ mới đi ra từ ngữ cảnh của bạn, nên mỗi từ đều có một lý do để được nhớ.', kind: 'vocab' },
  { index: '02', title: 'Nói cùng Agent', description: 'Một prompt đủ mở để bạn nói thật. Một phản hồi đủ cụ thể để lần sau tốt hơn.', kind: 'speaking' },
  { index: '03', title: 'Thấy lỗi lặp lại', description: 'Mimic để ý những điểm hay vấp, không chỉ cộng thêm một con số vào streak.', kind: 'progress' },
]

function PillarMock({ kind }: { kind: Pillar['kind'] }) {
  if (kind === 'vocab') return <div className="pillar-mock vocab-mock"><div className="mock-top"><span>CONTEXT CAPTURE</span><Sparkles size={14} /></div><div className="mock-context">“A steady practice is better<br />than a perfect plan.”</div><div className="mock-found"><small>3 WORDS WORTH KEEPING</small><div><b>steady</b><span>ổn định, đều đặn</span></div><div><b>follow through</b><span>làm đến cùng</span></div></div></div>
  if (kind === 'speaking') return <div className="pillar-mock speaking-mock"><div className="mock-top"><span>YOUR LAST TAKE</span><span className="mock-score">78 <small>/100</small></span></div><div className="mock-transcript">“I started writing down three things every morning...”</div><div className="mock-feedback"><span className="feedback-tick">✓</span><div><small>PROGRESS AGENT</small><strong>Clearer than your last take.</strong></div></div><div className="mock-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
  return <div className="pillar-mock progress-mock"><div className="mock-top"><span>YOUR PATTERNS</span><span className="pattern-period">THIS MONTH</span></div><div className="pattern-row"><span className="pattern-line" /><div><b>Mạo từ “a / the”</b><small>12 lần gần đây</small></div><span className="pattern-trend">−18%</span></div><div className="pattern-row"><span className="pattern-line teal" /><div><b>Âm cuối /s/ và /t/</b><small>6 lần gần đây</small></div><span className="pattern-trend">−24%</span></div><div className="pattern-summary"><Check size={14} /> Patterns, not perfection.</div></div>
}

export function PillarSection() {
  return <section className="pillars-section" id="pillars"><div className="section-lede"><span className="marketing-kicker">THREE PARTS OF THE LOOP</span><h2>Không phải một kho<br />nội dung khác.</h2><p>Mimic kết nối những phần thường bị tách rời khi bạn tự học: biết một từ, thử nói, rồi nhìn lại chính cách mình nói.</p></div><div className="pillar-list">{pillars.map((pillar) => <article className={`pillar-row ${pillar.kind}`} key={pillar.index}><div className="pillar-copy"><span className="pillar-index">{pillar.index}</span><h3>{pillar.title}</h3><p>{pillar.description}</p><Link to={pillar.kind === 'vocab' ? '/vocab' : pillar.kind === 'speaking' ? '/speaking' : '/progress'}>Xem trong app <ArrowUpRight size={15} /></Link></div><PillarMock kind={pillar.kind} /></article>)}</div></section>
}
