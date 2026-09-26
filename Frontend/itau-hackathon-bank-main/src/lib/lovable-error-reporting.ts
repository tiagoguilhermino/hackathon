export function reportLovableError(error: Error, metadata?: Record<string, unknown>) {
  console.error("Lovable Error:", error, metadata);
}
