interface MiniBarProps {
  values: number[];
  errIdx?: number[];
}

export default function MiniBar({ values, errIdx = [] }: MiniBarProps) {
  const max = Math.max(...values, 1);
  return (
    <div className="bar-chart">
      {values.map((v, i) => (
        <div
          key={i}
          className={`bar ${errIdx.includes(i) ? "error-bar" : ""}`}
          style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}