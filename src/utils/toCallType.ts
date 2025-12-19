export function toCallType(t: string): "call" | "feedback" {
  if (t === "call" || t === "feedback") return t;
  throw new Error("invalid type");
}
