/* MVP OCEAN — restyled stick-figure explainer (Direction 1a: warm office).
   6 scenes retimed to the Andrew voiceover (~26.4s). Reads engine globals. */

const { Stage, Sprite, useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp } = window;
const R = React.createElement;
const OUT = '#20242b';
const VO_SRC = '/assets/mvp-video/voiceover.mp3';
const VO_DUR = 26.35;

/* ───────── helpers ───────── */
const rad = (d) => (d * Math.PI) / 180;
const endpt = (sx, sy, a, len) => [sx + len * Math.cos(rad(a)), sy + len * Math.sin(rad(a))];
const bob = (t, amp = 4, spd = 1.6, ph = 0) => Math.sin(t * spd + ph) * amp;
const useT = () => useSprite().localTime;

/* ───────── Character ───────── */
const EXPR = {
  neutral: { pupil: [0, 2], brows: null, mouth: <path d="M97 118 Q110 123 123 118" /> },
  happy: { pupil: [0, 0], brows: <g><path d="M80 58 Q94 50 106 57" /><path d="M114 57 Q126 50 140 58" /></g>,
    mouth: <path d="M90 112 Q110 132 130 112 Q110 122 90 112" fill="#3a2a2a" stroke="none" /> },
  excited: { pupil: [0, -1], brows: <g><path d="M80 54 Q94 46 106 53" /><path d="M114 53 Q126 46 140 54" /></g>,
    mouth: <path d="M92 108 Q110 140 128 108 Q110 120 92 108" fill="#3a2a2a" stroke="none" /> },
  worried: { pupil: [0, -2], brows: <g><path d="M82 52 Q96 48 106 54" /><path d="M114 54 Q124 48 138 52" /></g>,
    mouth: <ellipse cx="110" cy="120" rx="9" ry="7" fill="#3a2a2a" stroke="none" /> },
  sad: { pupil: [0, 3], brows: <g><path d="M82 50 Q97 52 107 58" /><path d="M113 58 Q123 52 138 50" /></g>,
    mouth: <path d="M97 124 Q110 114 123 124" /> },
  angry: { pupil: [0, 2], brows: <g><path d="M80 50 Q95 58 107 60" /><path d="M113 60 Q125 58 140 50" /></g>,
    mouth: <path d="M96 124 Q110 116 124 124" /> },
};

function Character({
  x, y, scale = 1, torso = '#2f6fd0', expr = 'neutral',
  lArm = 102, rArm = 78, lLen = 96, rLen = 96, lean = 0, blush = false, flip = false,
}) {
  const e = EXPR[expr] || EXPR.neutral;
  const [px, py] = e.pupil;
  const sL = [80, 168], sR = [140, 168];
  const [lhx, lhy] = endpt(sL[0], sL[1], lArm, lLen);
  const [rhx, rhy] = endpt(sR[0], sR[1], rArm, rLen);
  const st = { stroke: OUT, strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 220, height: 460,
      transform: `translate(-50%,-100%) scale(${scale}) rotate(${lean}deg)`,
      transformOrigin: '50% 100%', willChange: 'transform' }}>
      <svg width="220" height="460" viewBox="0 0 220 460" style={{ overflow: 'visible', transform: flip ? 'scaleX(-1)' : 'none' }}>
        <line x1="94" y1="272" x2="82" y2="446" {...st} />
        <line x1="126" y1="272" x2="138" y2="446" {...st} />
        <line x1={sL[0]} y1={sL[1]} x2={lhx} y2={lhy} {...st} />
        <line x1={sR[0]} y1={sR[1]} x2={rhx} y2={rhy} {...st} />
        <path d="M82 164 C72 162 70 176 70 196 L80 270 Q110 286 140 270 L150 196 C150 176 148 162 138 164 Q110 176 82 164 Z"
          fill={torso} stroke={OUT} strokeWidth="6" strokeLinejoin="round" />
        <line x1="110" y1="140" x2="110" y2="162" {...st} />
        <circle cx="110" cy="86" r="58" fill="#fdfdfb" stroke={OUT} strokeWidth="7" />
        {blush && <g fill="#ff9db0" opacity="0.75"><ellipse cx="80" cy="104" rx="12" ry="7" /><ellipse cx="140" cy="104" rx="12" ry="7" /></g>}
        <ellipse cx="94" cy="82" rx="14" ry="18" fill="#fff" stroke={OUT} strokeWidth="3" />
        <ellipse cx="126" cy="82" rx="14" ry="18" fill="#fff" stroke={OUT} strokeWidth="3" />
        <circle cx={94 + px} cy={84 + py} r="6.5" fill={OUT} />
        <circle cx={126 + px} cy={84 + py} r="6.5" fill={OUT} />
        <g stroke={OUT} strokeWidth="4.5" strokeLinecap="round" fill="none">{e.brows}</g>
        <g stroke={OUT} strokeWidth="4.5" strokeLinecap="round" fill="none">{e.mouth}</g>
      </svg>
    </div>
  );
}

/* ───────── generic positioned svg prop ───────── */
function Prop({ x, y, scale = 1, w, h, children, style }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${scale})`, willChange: 'transform', ...style }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>{children}</svg>
    </div>
  );
}

/* ───────── props ───────── */
function Lightbulb({ x, y, scale = 1, glow = 1, crack = 0 }) {
  return (
    <Prop x={x} y={y} scale={scale} w={260} h={320}>
      <circle cx="130" cy="120" r={110} fill="#ffe07a" opacity={0.32 * glow} />
      <circle cx="130" cy="120" r={78} fill="#fff3c0" opacity={0.5 * glow} />
      <circle cx="130" cy="118" r="72" fill={`hsl(46 100% ${72 - 18 * (1 - glow)}%)`} stroke={OUT} strokeWidth="7" />
      <path d="M108 118 L120 96 L130 128 L140 96 L152 118" fill="none" stroke={OUT} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity={0.35 + 0.5 * glow} />
      <rect x="108" y="182" width="44" height="30" rx="5" fill="#c9c9c9" stroke={OUT} strokeWidth="6" />
      <line x1="112" y1="196" x2="148" y2="196" stroke={OUT} strokeWidth="4" />
      {crack > 0 && <path d="M130 60 L120 100 L138 118 L124 150" fill="none" stroke={OUT} strokeWidth="4" strokeLinecap="round" opacity={crack} />}
    </Prop>
  );
}

function TaskBubble({ x, y, scale = 1, color, label }) {
  return (
    <Prop x={x} y={y} scale={scale} w={150} h={150}>
      <circle cx="75" cy="75" r="62" fill={color} stroke={OUT} strokeWidth="6" />
      <text x="75" y="80" fill="#fff" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="52" textAnchor="middle" dominantBaseline="central">{label}</text>
    </Prop>
  );
}

function Calendar({ x, y, scale = 1, month = 1 }) {
  return (
    <Prop x={x} y={y} scale={scale} w={220} h={230}>
      <rect x="24" y="30" width="172" height="176" rx="14" fill="#fff" stroke={OUT} strokeWidth="6" />
      <rect x="24" y="30" width="172" height="52" rx="14" fill="#c0563e" stroke={OUT} strokeWidth="6" />
      <rect x="52" y="16" width="14" height="34" rx="7" fill="#9c6c3d" stroke={OUT} strokeWidth="4" />
      <rect x="154" y="16" width="14" height="34" rx="7" fill="#9c6c3d" stroke={OUT} strokeWidth="4" />
      <text x="110" y="150" fill={OUT} fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="92" textAnchor="middle" dominantBaseline="central">{month}</text>
    </Prop>
  );
}

function GiftBox({ x, y, scale = 1 }) {
  return (
    <Prop x={x} y={y} scale={scale} w={220} h={200}>
      <rect x="34" y="74" width="152" height="112" rx="6" fill="#e6ddca" stroke={OUT} strokeWidth="6" />
      <rect x="24" y="46" width="172" height="40" rx="6" fill="#c0563e" stroke={OUT} strokeWidth="6" />
      <rect x="96" y="46" width="28" height="140" fill="#e08a3c" stroke={OUT} strokeWidth="5" />
      <path d="M110 46 C80 6 40 26 110 44 C180 26 140 6 110 46 Z" fill="#e08a3c" stroke={OUT} strokeWidth="5" />
    </Prop>
  );
}

function VisionTower({ x, y, scale = 1, wobble = 0, crossed = 0 }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${scale})`, transformOrigin: '50% 100%' }}>
      <svg width="300" height="440" viewBox="0 0 300 440" style={{ overflow: 'visible' }}>
        <g transform={`rotate(${wobble} 150 430)`}>
          <rect x="70" y="360" width="160" height="70" fill="#8fa6b2" stroke={OUT} strokeWidth="6" />
          <rect x="86" y="286" width="128" height="74" fill="#c68f56" stroke={OUT} strokeWidth="6" />
          <rect x="60" y="214" width="150" height="72" fill="#7d9b6b" stroke={OUT} strokeWidth="6" />
          <rect x="104" y="150" width="96" height="64" fill="#c0563e" stroke={OUT} strokeWidth="6" />
          <rect x="118" y="96" width="60" height="54" fill="#3f7c8c" stroke={OUT} strokeWidth="6" />
          <rect x="132" y="58" width="30" height="38" fill="#d9a441" stroke={OUT} strokeWidth="5" />
        </g>
        {crossed > 0 && (
          <g stroke="#ff5b6e" strokeWidth="26" strokeLinecap="round" opacity={crossed}>
            <line x1="44" y1="90" x2="256" y2="400" /><line x1="256" y1="90" x2="44" y2="400" />
          </g>
        )}
      </svg>
    </div>
  );
}

function MvpFlag({ x, y, scale = 1, checked = 0 }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${scale})`, transformOrigin: '50% 100%' }}>
      <svg width="220" height="300" viewBox="0 0 220 300" style={{ overflow: 'visible' }}>
        <line x1="70" y1="20" x2="70" y2="290" stroke={OUT} strokeWidth="9" strokeLinecap="round" />
        <path d="M70 26 L192 58 L70 96 Z" fill="#e78bb0" stroke={OUT} strokeWidth="6" strokeLinejoin="round" />
        <circle cx="70" cy="290" r="10" fill={OUT} />
        {checked > 0 && (
          <g opacity={checked}>
            <circle cx="150" cy="200" r="40" fill="#2f9e5b" />
            <path d="M132 200 L146 216 L172 184" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
}

function PillButton({ x, y, scale = 1, label, color }) {
  return (
    <Prop x={x} y={y} scale={scale} w={220} h={92}>
      <rect x="6" y="6" width="208" height="80" rx="40" fill={color} stroke={OUT} strokeWidth="6" />
      <text x="110" y="49" fill="#fff" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="42" textAnchor="middle" dominantBaseline="central">{label}</text>
    </Prop>
  );
}

function Phone({ x, y, scale = 1, lit = 1 }) {
  return (
    <Prop x={x} y={y} scale={scale} w={130} h={210}>
      <rect x="14" y="6" width="102" height="198" rx="18" fill="#2b2f36" stroke={OUT} strokeWidth="6" />
      <rect x="26" y="24" width="78" height="150" rx="6" fill={lit ? '#8fd0e6' : '#3a4a5a'} />
      <circle cx="65" cy="189" r="8" fill="#4a4f57" />
    </Prop>
  );
}

function ChatBubble({ x, y, scale = 1, color = '#3f7c8c' }) {
  return (
    <Prop x={x} y={y} scale={scale} w={130} h={100}>
      <rect x="8" y="8" width="114" height="66" rx="20" fill={color} stroke={OUT} strokeWidth="5" />
      <path d="M40 70 L34 92 L58 72 Z" fill={color} stroke={OUT} strokeWidth="5" strokeLinejoin="round" />
      <g fill="#fff"><circle cx="45" cy="41" r="7" /><circle cx="65" cy="41" r="7" /><circle cx="85" cy="41" r="7" /></g>
    </Prop>
  );
}

function Envelope({ x, y, scale = 1, struck = 0 }) {
  return (
    <Prop x={x} y={y} scale={scale} w={190} h={140}>
      <rect x="10" y="18" width="170" height="112" rx="10" fill="#fff" stroke={OUT} strokeWidth="6" />
      <path d="M10 26 L95 84 L180 26" fill="none" stroke={OUT} strokeWidth="6" strokeLinecap="round" />
      {struck > 0 && <line x1="20" y1="126" x2="176" y2="22" stroke="#ff5b6e" strokeWidth="16" strokeLinecap="round" opacity={struck} />}
    </Prop>
  );
}

function PaperBoat({ x, y, scale = 1, rot = 0 }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${scale}) rotate(${rot}deg)`, willChange: 'transform' }}>
      <svg width="200" height="180" viewBox="0 0 200 180" style={{ overflow: 'visible' }}>
        <path d="M28 120 L172 120 L146 164 L54 164 Z" fill="#eee4d0" stroke={OUT} strokeWidth="6" strokeLinejoin="round" />
        <line x1="100" y1="28" x2="100" y2="120" stroke={OUT} strokeWidth="7" strokeLinecap="round" />
        <path d="M100 30 L100 116 L44 116 Z" fill="#e78bb0" stroke={OUT} strokeWidth="6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Tumbleweed({ x, y, scale = 1, rot = 0 }) {
  return (
    <Prop x={x} y={y} scale={scale} w={120} h={120}>
      <g stroke="#b08a5a" strokeWidth="4" fill="none" opacity="0.9" transform={`rotate(${rot} 60 60)`}>
        <circle cx="60" cy="60" r="44" /><path d="M20 60 L100 60 M60 20 L60 100 M32 32 L88 88 M88 32 L32 88" /><circle cx="60" cy="60" r="26" />
      </g>
    </Prop>
  );
}

/* ───────── captions / logo / camera / audio ───────── */
function CaptionTrack({ cues }) {
  const t = useT();
  const cue = cues.find((c) => t >= c.start && t <= c.end);
  if (!cue) return null;
  const words = cue.text.split(' ');
  const prog = clamp((t - cue.start) / Math.max(0.001, (cue.end - cue.start) * 0.7), 0, 1);
  const shown = Math.max(1, Math.ceil(prog * words.length));
  const acc = cue.accent || '#3ddc84';
  return (
    <div style={{ position: 'absolute', left: '50%', bottom: 205, transform: 'translateX(-50%)', width: 960,
      display: 'flex', flexWrap: 'wrap', gap: '4px 15px', justifyContent: 'center', alignItems: 'center',
      fontFamily: 'Poppins, system-ui, sans-serif', fontWeight: 800, fontSize: 58, lineHeight: 1.08, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {words.slice(0, shown).map((w, i) => {
        const active = i === shown - 1;
        return <span key={i} style={{ color: active ? acc : '#fff', WebkitTextStroke: '5px #111', paintOrder: 'stroke fill',
          textShadow: '0 4px 0 rgba(0,0,0,0.28)', transform: active ? 'scale(1.06)' : 'scale(1)', display: 'inline-block' }}>{w}</span>;
      })}
    </div>
  );
}

function LogoTag() {
  return <div style={{ position: 'absolute', top: 40, right: 44, fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 34, letterSpacing: '1px', color: '#2f6fd0', opacity: 0.9 }}>MVP OCEAN</div>;
}

function Camera({ from = 1, to = 1.08, ox = 50, oy = 50, children, ease = Easing.easeInOutSine }) {
  const { duration, localTime } = useSprite();
  const p = duration ? ease(clamp(localTime / duration, 0, 1)) : 0;
  const s = from + (to - from) * p;
  return <div style={{ position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: `${ox}% ${oy}%`, willChange: 'transform' }}>{children}</div>;
}

function SceneFade({ children }) {
  const t = useT();
  const o = clamp(t / 0.22, 0, 1);
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}>{children}</div>;
}

/* Audio: audible <audio> synced to the playhead for preview + hidden <video>
   carrying the mp3 so the video export mixes its audio in. */
function AudioTrack() {
  const { time, playing } = useTimeline();
  const aRef = React.useRef(null);
  React.useEffect(() => {
    const a = aRef.current; if (!a) return;
    const target = Math.min(time, VO_DUR - 0.02);
    if (Math.abs(a.currentTime - target) > 0.22) a.currentTime = target;
    // keep trying to (re)start — browsers block the first autoplay until a gesture
    if (playing) { if (a.paused) a.play().catch(() => {}); } else if (!a.paused) a.pause();
  }, [time, playing]);
  // resume on the first user interaction if autoplay was blocked
  React.useEffect(() => {
    const kick = () => { const a = aRef.current; if (a && playing && a.paused) a.play().catch(() => {}); };
    window.addEventListener('pointerdown', kick);
    window.addEventListener('keydown', kick);
    return () => { window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); };
  }, [playing]);
  return (
    <>
      <audio ref={aRef} src={VO_SRC} preload="auto" />
      <video src={VO_SRC} muted playsInline preload="auto"
        data-om-exportable-video-play-start={0} data-om-exportable-video-play-end={VO_DUR} data-om-exportable-video-play-speed={1}
        style={{ position: 'absolute', width: 2, height: 2, opacity: 0, pointerEvents: 'none', bottom: 0, left: 0 }} />
    </>
  );
}

/* ═════════════ WARM OFFICE (shared set) ═════════════ */
function OfficeWarm({ shelf = true, window: win = true, desk = true, plant = true }) {
  const S = { stroke: OUT, strokeWidth: 5, strokeLinejoin: 'round' };
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect x="0" y="0" width="1080" height="1360" fill="#ece2cf" />
      <rect x="0" y="1300" width="1080" height="620" fill="#caa06d" />
      <rect x="0" y="1300" width="1080" height="26" fill="#b98d58" />
      {[1420, 1560, 1700, 1840].map((y) => <line key={y} x1="0" y1={y} x2="1080" y2={y} stroke="#b98d58" strokeWidth="3" opacity="0.5" />)}
      {win && <g>
        <rect x="70" y="230" width="360" height="300" rx="10" fill="#bcd8e6" {...S} />
        <rect x="90" y="360" width="120" height="150" fill="#9fb4bf" />
        <rect x="230" y="300" width="90" height="210" fill="#8fa6b2" />
        <rect x="335" y="380" width="80" height="130" fill="#9fb4bf" />
        <line x1="250" y1="230" x2="250" y2="530" {...S} strokeWidth="6" />
        <line x1="70" y1="380" x2="430" y2="380" {...S} strokeWidth="6" />
      </g>}
      {shelf && <g>
        <rect x="720" y="250" width="300" height="220" rx="8" fill="#c68f56" {...S} />
        <line x1="720" y1="360" x2="1020" y2="360" {...S} />
        {[['#c0563e', 740], ['#3f7c8c', 792], ['#d9a441', 844], ['#7d9b6b', 896], ['#c0563e', 948]].map(([c, xx], i) => <rect key={i} x={xx} y="272" width="40" height="78" rx="3" fill={c} {...S} strokeWidth="3" />)}
        {[['#3f7c8c', 745], ['#d9a441', 800], ['#c0563e', 855], ['#7d9b6b', 910]].map(([c, xx], i) => <rect key={'b' + i} x={xx} y="382" width="46" height="70" rx="3" fill={c} {...S} strokeWidth="3" />)}
      </g>}
      {plant && <g>
        <rect x="120" y="1180" width="120" height="150" rx="10" fill="#b5623c" {...S} />
        <path d="M180 1180 C120 1060 130 940 180 900 C230 940 240 1060 180 1180 Z" fill="#4f8f5f" {...S} />
        <path d="M180 1150 C120 1120 90 1060 96 1000 C150 1020 180 1080 180 1150 Z" fill="#5ba06c" {...S} />
        <path d="M180 1150 C240 1120 270 1060 264 1000 C210 1020 180 1080 180 1150 Z" fill="#5ba06c" {...S} />
      </g>}
      {desk && <g>
        <rect x="560" y="1170" width="430" height="30" rx="6" fill="#b07d4a" {...S} />
        <rect x="600" y="1200" width="26" height="160" fill="#9c6c3d" {...S} />
        <rect x="924" y="1200" width="26" height="160" fill="#9c6c3d" {...S} />
        <rect x="690" y="980" width="230" height="150" rx="10" fill="#2b2f36" {...S} />
        <rect x="708" y="998" width="194" height="114" rx="4" fill="#46586b" />
        <rect x="792" y="1130" width="26" height="34" fill="#2b2f36" {...S} />
        <rect x="756" y="1160" width="98" height="12" rx="6" fill="#2b2f36" {...S} />
        <rect x="636" y="1120" width="46" height="50" rx="6" fill="#c0563e" {...S} />
        <path d="M682 1132 q22 4 22 20 t-22 18" fill="none" stroke={OUT} strokeWidth="6" />
      </g>}
    </svg>
  );
}

/* ═════════════ SCENE 1 — idea overload (0–4.2s) ═════════════ */
function SceneOne() {
  const t = useT();
  const glow = interpolate([0, 1.6, 1.9, 2.2, 2.6, 4.2], [1, 1, 0.5, 1, 0.15, 0.05], Easing.easeInOutSine)(t);
  const bulbScale = interpolate([0, 1.6, 2.2, 2.6, 4.2], [1, 1.02, 1.22, 0.9, 0.86], Easing.easeInOutCubic)(t);
  const crack = interpolate([0, 2.3, 2.7, 4.2], [0, 0, 1, 1])(t);
  const expr = t < 1.6 ? 'neutral' : t < 2.6 ? 'worried' : 'sad';
  const rArm = interpolate([0, 1.6, 2.3, 2.8, 4.2], [-52, -52, -62, 74, 78], Easing.easeInOutCubic)(t);
  const lArm = interpolate([0, 2.6, 3.0], [104, 104, 84])(t);
  const lean = interpolate([0, 2.6, 3.0], [0, 0, 4])(t);
  return (
    <SceneFade>
      <Camera from={1} to={1.08} ox={44} oy={40}>
        <OfficeWarm />
        <Lightbulb x={690} y={250 + bob(t, 10, 1.4)} scale={bulbScale} glow={glow} crack={crack} />
        <Character x={420} y={1460} scale={1.62} torso="#2f6fd0" expr={expr} rArm={rArm} lArm={lArm} lean={lean} />
      </Camera>
      <CaptionTrack cues={[
        { start: 0, end: 2.5, text: 'Most people kill their idea', accent: '#ff5b5b' },
        { start: 2.55, end: 4.2, text: 'by working too hard on it', accent: '#3ddc84' },
      ]} />
    </SceneFade>
  );
}

/* ═════════════ SCENE 2 — Domain. Logo. App. → six months gone (4.2–8.3s) ═════════════ */
function SceneTwo() {
  const t = useT();
  const pop = (s) => interpolate([s, s + 0.35], [0, 1], Easing.easeOutBack)(t);
  const month = Math.min(6, 1 + Math.floor(interpolate([2.6, 3.7], [0, 6])(t)));
  const expr = t < 1.2 ? 'neutral' : t < 3.4 ? 'worried' : 'sad';
  const armFlail = bob(t, 22, 6);
  return (
    <SceneFade>
      <Camera from={1.02} to={1.09} ox={50} oy={42}>
        <OfficeWarm shelf={false} />
        <Character x={430} y={1470} scale={1.6} torso="#7d9b6b" expr={expr}
          rArm={70 + armFlail} lArm={110 - armFlail} lean={interpolate([0, 3.4, 4.1], [0, 0, -3])(t)} />
        <div style={{ opacity: pop(0.3), transform: `scale(${pop(0.3)})`, transformOrigin: 'center' }}>
          <TaskBubble x={300} y={430 + bob(t, 12, 2.2, 0)} scale={pop(0.3)} color="#3f7c8c" label="D" /></div>
        <div style={{ opacity: pop(1.0), transform: `scale(${pop(1.0)})` }}>
          <TaskBubble x={540} y={330 + bob(t, 12, 2.2, 1)} scale={pop(1.0)} color="#c0563e" label="L" /></div>
        <div style={{ opacity: pop(1.9) }}>
          <TaskBubble x={780} y={440 + bob(t, 12, 2.2, 2)} scale={pop(1.9)} color="#d9a441" label="A" /></div>
        <Calendar x={850} y={760} scale={interpolate([2.5, 3.0], [0, 1.15], Easing.easeOutBack)(t)} month={month} />
      </Camera>
      <CaptionTrack cues={[
        { start: 0.1, end: 2.5, text: 'Domain. Logo. App.', accent: '#3f7c8c' },
        { start: 2.6, end: 4.1, text: 'Six months — gone', accent: '#ff5b5b' },
      ]} />
    </SceneFade>
  );
}

/* ═════════════ SCENE 3 — the twist: nobody wanted it (8.3–11.3s) ═════════════ */
function SceneThree() {
  const t = useT();
  const expr = t < 1.6 ? 'excited' : t < 1.95 ? 'worried' : 'sad';
  const rArm = interpolate([0, 1.5, 2.0], [-40, -40, 80], Easing.easeInOutCubic)(t);
  const lArm = interpolate([0, 1.5, 2.0], [-140, -140, 100], Easing.easeInOutCubic)(t);
  const boxPop = interpolate([0.2, 0.7], [0, 1], Easing.easeOutBack)(t);
  const tumbleX = interpolate([1.9, 2.9], [1150, -120])(t);
  return (
    <SceneFade>
      <Camera from={1.03} to={1.1} ox={48} oy={45}>
        <OfficeWarm window={false} />
        <Character x={380} y={1470} scale={1.6} torso="#c0563e" expr={expr} rArm={rArm} lArm={lArm}
          lean={interpolate([0, 2.0, 2.6], [0, 0, 4])(t)} />
        <div style={{ opacity: boxPop, transform: `scale(${boxPop})`, transformOrigin: 'center' }}>
          <GiftBox x={720} y={640 + bob(t, 6, 1.2)} scale={1.5} /></div>
        {t > 1.85 && <div style={{ opacity: clamp((t - 1.85) / 0.4, 0, 1) }}>
          <div style={{ position: 'absolute', left: 470, top: 560, fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 120, color: OUT, transform: `translate(-50%,-50%) rotate(${bob(t, 6, 2)}deg)` }}>?</div></div>}
        {t > 1.9 && <Tumbleweed x={tumbleX} y={1250} scale={1.3} rot={(t - 1.9) * 300} />}
      </Camera>
      <CaptionTrack cues={[
        { start: 0.1, end: 1.7, text: 'Then they find the twist', accent: '#d9a441' },
        { start: 1.8, end: 3.0, text: 'Nobody wanted it', accent: '#ff5b5b' },
      ]} />
    </SceneFade>
  );
}

/* ═════════════ SCENE 4 — what an MVP really is (11.3–18.8s) ═════════════ */
function SceneFour() {
  const t = useT();
  const wobble = bob(t, 2.4, 3.2) * clamp((2.4 - t) / 1.2, 0, 1);
  const crossed = interpolate([2.2, 2.8], [0, 1], Easing.easeOutQuad)(t);
  const flagUp = interpolate([3.0, 3.6], [0, 1], Easing.easeOutBack)(t);
  const check = interpolate([3.8, 4.3], [0, 1], Easing.easeOutBack)(t);
  const yes = interpolate([4.3, 4.7], [0, 1], Easing.easeOutBack)(t);
  const no = interpolate([4.6, 5.0], [0, 1], Easing.easeOutBack)(t);
  const rArm = interpolate([0, 2.4, 3.2, 7.5], [-46, -46, -110, -110], Easing.easeInOutCubic)(t);
  return (
    <SceneFade>
      <Camera from={1.0} to={1.05} ox={50} oy={44}>
        <OfficeWarm desk={false} shelf={false} plant={false} />
        <div style={{ position: 'absolute', left: 250, top: 470, transform: 'translateX(-50%)', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 40, color: OUT, opacity: 0.85 }}>YOUR "VISION"</div>
        <div style={{ position: 'absolute', left: 830, top: 470, transform: 'translateX(-50%)', fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 40, color: '#2f9e5b', opacity: flagUp }}>THE MVP</div>
        <VisionTower x={250} y={1150} scale={0.95} wobble={wobble} crossed={crossed} />
        <div style={{ opacity: flagUp }}><MvpFlag x={830} y={1150} scale={1.35} checked={check} /></div>
        <Character x={560} y={1520} scale={1.15} torso="#3f7c8c" expr={t < 2.8 ? 'neutral' : 'happy'} rArm={rArm} lArm={104} />
        <div style={{ opacity: yes, transform: `translateY(${(1 - yes) * 20}px)` }}><PillButton x={430} y={1300} scale={1.05} label="YES" color="#2f9e5b" /></div>
        <div style={{ opacity: no, transform: `translateY(${(1 - no) * 20}px)` }}><PillButton x={700} y={1300} scale={1.05} label="NO" color="#e78bb0" /></div>
      </Camera>
      <CaptionTrack cues={[
        { start: 0.1, end: 2.0, text: 'An MVP is the smallest thing', accent: '#3f7c8c' },
        { start: 2.05, end: 3.6, text: 'a real human can say', accent: '#3f7c8c' },
        { start: 3.65, end: 5.1, text: 'yes or no to', accent: '#3ddc84' },
        { start: 5.3, end: 7.5, text: 'A test, not a prototype', accent: '#ff5b5b' },
      ]} />
    </SceneFade>
  );
}

/* ═════════════ SCENE 5 — text ten parents tonight (18.8–22.8s) ═════════════ */
function SceneFive() {
  const t = useT();
  const tap = bob(t, 8, 9) * clamp((1.8 - t) / 0.8, 0, 1);
  const chat = (s) => clamp((t - s) / 0.35, 0, 1) * clamp((s + 1.6 - t) / 0.5, 0, 1);
  const rise = (s) => clamp((t - s) / 1.4, 0, 1);
  const struck = interpolate([2.7, 3.2], [0, 1], Easing.easeOutQuad)(t);
  return (
    <SceneFade>
      <Camera from={1.02} to={1.08} ox={40} oy={48}>
        <OfficeWarm shelf={false} />
        <Character x={340} y={1480} scale={1.5} torso="#2f6fd0" expr="happy" rArm={30 + tap} lArm={150} />
        <Phone x={470} y={870} scale={1.15} />
        <Character x={860} y={1470} scale={1.32} torso="#d9a441" expr={t > 1.6 ? 'happy' : 'neutral'} rArm={110} lArm={70} flip />
        <div style={{ opacity: chat(0.4) }}><ChatBubble x={600} y={640 - rise(0.4) * 120} scale={1} color="#3f7c8c" /></div>
        <div style={{ opacity: chat(0.85) }}><ChatBubble x={720} y={560 - rise(0.85) * 120} scale={1.05} color="#c0563e" /></div>
        <div style={{ opacity: chat(1.3) }}><ChatBubble x={640} y={500 - rise(1.3) * 120} scale={0.95} color="#7d9b6b" /></div>
        {t > 2.2 && <div style={{ opacity: clamp((t - 2.2) / 0.4, 0, 1) }}><Envelope x={560} y={430} scale={1.15} struck={struck} /></div>}
      </Camera>
      <CaptionTrack cues={[
        { start: 0.1, end: 2.0, text: 'Text ten parents tonight', accent: '#3f7c8c' },
        { start: 2.1, end: 4.0, text: 'No email? No money.', accent: '#ff5b5b' },
      ]} />
    </SceneFade>
  );
}

/* ═════════════ SCENE 6 — it should embarrass you (22.8–26.35s) ═════════════ */
function SceneSix() {
  const t = useT();
  const lean = interpolate([0, 0.6, 0.9, 1.3], [0, 8, 8, 0], Easing.easeInOutCubic)(t);
  const rArm = interpolate([0, 0.6, 0.9, 2.4, 3.2], [55, 60, 58, 40, -70], Easing.easeInOutCubic)(t);
  const expr = t < 1.3 ? 'neutral' : t < 2.6 ? 'happy' : 'excited';
  const boatX = interpolate([1.0, 3.4], [560, 980])(t);
  const boatY = 1420 + bob(t, 10, 2.4);
  const boatRot = bob(t, 5, 2.4);
  return (
    <SceneFade>
      <Camera from={1.03} to={1.1} ox={46} oy={52}>
        <OfficeWarm desk={false} />
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <path d="M360 1380 Q720 1330 1080 1380 L1080 1545 Q700 1515 360 1545 Z" fill="#3f9ba6" opacity="0.92" />
          <path d="M430 1420 q40 -18 90 0 M620 1408 q40 -18 90 0 M820 1426 q40 -18 90 0" fill="none" stroke="#bfe6ea" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        </svg>
        <PaperBoat x={boatX} y={boatY} scale={0.86} rot={boatRot} />
        <Character x={300} y={1500} scale={1.55} torso="#c0563e" expr={expr} rArm={rArm} lArm={110} lean={lean} blush={t > 1.0} />
      </Camera>
      <CaptionTrack cues={[
        { start: 0.1, end: 1.9, text: 'It should embarrass you a little', accent: '#e78bb0' },
        { start: 2.0, end: 3.55, text: 'Test before you build', accent: '#3ddc84' },
      ]} />
    </SceneFade>
  );
}

/* ═════════════ MASTER ═════════════ */
function MvpVideoFull() {
  return R(Stage, { width: 1080, height: 1920, duration: VO_DUR, background: '#ece2cf', persistKey: 'mvpfull' },
    R(Sprite, { start: 0, end: 4.2 }, R(SceneOne)),
    R(Sprite, { start: 4.2, end: 8.3 }, R(SceneTwo)),
    R(Sprite, { start: 8.3, end: 11.3 }, R(SceneThree)),
    R(Sprite, { start: 11.3, end: 18.8 }, R(SceneFour)),
    R(Sprite, { start: 18.8, end: 22.8 }, R(SceneFive)),
    R(Sprite, { start: 22.8, end: VO_DUR }, R(SceneSix)),
    R(LogoTag, {}),
    R(AudioTrack, {}),
  );
}

Object.assign(window, { Character, Lightbulb, CaptionTrack, LogoTag, Camera, OfficeWarm, AudioTrack, MvpVideoFull });
