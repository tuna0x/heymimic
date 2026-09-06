import { Headphones, Pause, Play, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Waveform } from '../speaking/Waveform'

export function Hero() {
  const [playing, setPlaying] = useState(false)
  return <section className="marketing-hero">
    <div className="hero-copy"><span className="hero-kicker"><i /> ENGLISH, BUT PERSONAL</span><h1>Nói tiếng Anh<br /><em>theo cách của bạn.</em></h1><p>Mimic giúp bạn xây phản xạ nói từ những điều thật sự xuất hiện trong cuộc sống của mình — một từ, một câu, một lần nói mỗi ngày.</p><div className="hero-actions"><Link className="marketing-cta" to="/signup">Bắt đầu học</Link><a className="hero-text-link" href="#why-mimic">Xem Mimic hoạt động <span>↘</span></a></div><div className="hero-note"><Sparkles size={15} /><span>Được xây dựng bởi một người học<br />đang cần một cách luyện speaking tốt hơn.</span></div></div>
    <div className="hero-demo-wrap"><div className="demo-corner top-left">MIMIC / SHADOWING SAMPLE</div><div className="demo-corner top-right">01 — 00:12</div><div className="hero-demo"><div className="demo-agent"><span className="agent-dot" /><span>Speaking Agent</span><span className="agent-status">READY</span></div><div className="demo-quote">“I’ve been meaning to<br /><strong>get back into the habit.</strong>”</div><div className="demo-translation">Mình đã định quay lại thói quen này từ lâu.</div><Waveform active={playing} /><div className="demo-controls"><button className={playing ? 'demo-play playing' : 'demo-play'} onClick={() => setPlaying(!playing)} aria-label={playing ? 'Tạm dừng demo' : 'Nghe thử demo'}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button><div><span>{playing ? 'Đang phát shadowing sample' : 'Nghe thử một câu'}</span><small>0:12 · natural pace</small></div><Headphones className="demo-headphones" size={17} /></div></div><div className="demo-word-chip chip-one">rhythm</div><div className="demo-word-chip chip-two">repeat / reshape</div><div className="demo-ring" /></div>
  </section>
}
