import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = ComponentProps<"input"> & {
  label: string;
  name: string;
  errors?: string[];
};

export function AuthFormField({ label, name, errors, ...props }: Props) {
  const invalid = Boolean(errors?.length);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
        {...props}
      />
      {invalid && (
        <p id={`${name}-error`} className="text-xs text-destructive">
          {errors![0]}
        </p>
      )}
    </div>
  );
}
