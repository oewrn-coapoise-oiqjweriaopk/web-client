interface ToggleProps {
  on: boolean;
  onChange: (val: boolean) => void;
}

export default function Toggle({ on, onChange }: ToggleProps) {
  return (
    <div
      className={`toggle ${on ? "on" : ""}`}
      onClick={() => onChange(!on)}
    />
  );
}