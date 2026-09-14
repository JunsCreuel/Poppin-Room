export default function Gauge({ label, value, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="gauge">
      <div className="gauge-head">
        <span className="gauge-label">{label}</span>
        <span className="gauge-value">{Math.min(value, max)} / {max}</span>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
