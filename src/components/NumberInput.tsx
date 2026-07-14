import React, { useState, useEffect } from "react";

interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> {
  value: number | undefined;
  onChange: (val: number) => void;
  onConfirm?: () => void;
  min?: number;
  max?: number;
}

export default function NumberInput({
  value,
  onChange,
  onConfirm,
  min,
  max,
  ...props
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "");

  useEffect(() => {
    if (value === undefined) {
      setLocalValue("");
      return;
    }
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
      val = val.replace(/^0+/, "");
      if (val === "") val = "0";
    }
    setLocalValue(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      let parsed = parseFloat(localValue);
      if (!isNaN(parsed)) {
        if (min !== undefined && parsed < min) parsed = min;
        if (max !== undefined && parsed > max) parsed = max;
        setLocalValue(parsed.toString());
        onChange(parsed);
        if (onConfirm) onConfirm();
      } else {
        setLocalValue(value?.toString() ?? "0");
      }
      e.currentTarget.blur();
    }
    if (props.onKeyDown) props.onKeyDown(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Revert to original value if blurred without pressing Enter
    setLocalValue(value?.toString() ?? "0");
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
