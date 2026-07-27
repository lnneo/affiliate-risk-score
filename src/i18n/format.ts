export function replaceCount(template: string, count: number | string): string {
  return template.replace('{count}', String(count)).replace('{n}', String(count));
}
