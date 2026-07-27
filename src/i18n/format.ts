export function replaceCount(template: string, count: number | string): string {
  return template.replace('{count}', String(count)).replace('{n}', String(count));
}

export function formatReason(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function resolveFraudSignalReason(
  signal: { reason: string; reasonKey?: string; reasonParams?: Record<string, string | number> },
  fraudReasons: Record<string, string>,
): string {
  if (signal.reasonKey && fraudReasons[signal.reasonKey]) {
    return formatReason(fraudReasons[signal.reasonKey], signal.reasonParams);
  }
  return signal.reason;
}
