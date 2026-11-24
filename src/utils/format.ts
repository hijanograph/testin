export const pad2 = (value: number) => String(value).padStart(2, '0');

export const capitalize = (value?: string) => value && value[0].toUpperCase() + value.slice(1);
