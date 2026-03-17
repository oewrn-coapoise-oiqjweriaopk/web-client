interface SparklineProps {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}

export default function Sparkline({ data, color = "#00E5FF", w = 60, h = 20 }: SparklineProps) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}