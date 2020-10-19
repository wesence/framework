import Chance from 'chance';

export function randomString(
  length?: number,
  charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
): string {
  const options: { length?: number; pool?: string } = {};

  if (length) {
    options.length = length;
  }

  if (charset) {
    options.pool = charset;
  }
  const instance = Chance();
  return instance.string(options);
}
