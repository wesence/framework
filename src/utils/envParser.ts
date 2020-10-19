import { camelCase, set } from 'lodash';

export function parsePort(): any {
  const { PORT } = process.env;
  const port = Number(PORT || '0');

  if (!port) {
    return {};
  }

  return { port };
}

export function parseDatabases(): any {
  const databases = {};

  Object.keys(process.env)
    .filter((key) => key.indexOf('DB_') === 0)
    .forEach((key: string) => {
      const parts = key.split('_');
      const [, namePart] = parts.splice(0, 2);
      const optionKey = camelCase(parts.join('_'));
      set(databases, `${namePart}.${optionKey}`, process.env[key]);
    });

  return { databases };
}

export function parseSession(): any {
  const session = {};

  Object.keys(process.env)
    .filter((key) => key.indexOf('SESSION_') === 0)
    .forEach((key: string) => {
      const parts = key.split('_');
      parts.splice(0, 1);
      const optionKey = camelCase(parts.join('_'));
      set(session, optionKey, process.env[key]);
    });

  return { session };
}

export function parseAws(): any {
  const aws: any = {};

  Object.keys(process.env)
    .filter((key) => key.indexOf('AWS_') === 0)
    .forEach((key: string) => {
      const parts = key.split('_');
      parts.splice(0, 1);
      if (parts[0].toLowerCase() === 's3') {
        if (!aws.s3) {
          aws.s3 = {};
        }

        const s3Parts = parts.slice(1);
        const optionKey = camelCase(s3Parts.join('_'));
        set(aws.s3, optionKey, process.env[key]);
        return;
      }
      const optionKey = camelCase(parts.join('_'));
      set(aws, optionKey, process.env[key]);
    });

  return { aws };
}

export default function parseEnv(): any {
  const parsed: any = {};

  Object.assign(parsed, parsePort());
  Object.assign(parsed, parseDatabases());
  Object.assign(parsed, parseSession());
  Object.assign(parsed, parseAws());

  return parsed;
}
