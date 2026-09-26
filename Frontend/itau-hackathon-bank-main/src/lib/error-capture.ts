let lastError: Error | null = null;

export function captureError(err: Error) {
  lastError = err;
}

export function consumeLastCapturedError(): Error | null {
  const err = lastError;
  lastError = null;
  return err;
}
