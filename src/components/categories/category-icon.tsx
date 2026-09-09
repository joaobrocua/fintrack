import { type CSSProperties, createElement } from "react";
import { getCategoryIcon } from "@/lib/icons";

/**
 * Renders one of the curated Lucide icons by its registry name. Kept as its
 * own component so we never bind a component to a capitalized local during
 * another component's render.
 */
export function CategoryIcon({
  name,
  className,
  style,
}: {
  name: string | null | undefined;
  className?: string;
  style?: CSSProperties;
}) {
  return createElement(getCategoryIcon(name), { className, style });
}
