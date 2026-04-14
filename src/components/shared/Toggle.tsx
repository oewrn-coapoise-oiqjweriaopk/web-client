interface ToggleProps {
  on: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({ on, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      className={`toggle ${on ? "on" : ""}`}
      onClick={() => onChange(!on)}
      disabled={disabled}
    />
  );
}
