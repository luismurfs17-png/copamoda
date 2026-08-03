export default function InputNumber({
  label,
  value,
  onChange,
  min = 0.1,
  step = "0.1",
  required = true,
}) {
  return (
    <label className="field-tailwind">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}
