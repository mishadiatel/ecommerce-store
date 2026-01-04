export function updateMailTemplate(
  template: string,
  data: Record<string, string>,
): string {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, key: string) => {
    const value = data[key.trim()];
    return value !== undefined ? value : '';
  });
}
