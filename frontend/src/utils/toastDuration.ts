export type ToastVariant = 'success' | 'error';

export const RESUME_GRACE_MS = 1000;

/**
 * Compute adaptive auto-dismiss duration based on toast variant and word count.
 * - Success: 4000ms (short confirmation) up to 5500ms (longer informative message).
 * - Error: 6000ms (short error) up to 10000ms (1-2 sentence validation/system error).
 */
export function computeToastDurationMs(message: string, variant: ToastVariant): number {
  const words = message.trim().split(/\s+/).filter(Boolean).length;
  if (variant === 'error') {
    return Math.min(10000, Math.max(6000, 3200 + words * 300));
  }
  return Math.min(5500, Math.max(4000, 2800 + words * 250));
}
