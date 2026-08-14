import { SENSITIVE_KEYS } from '../constants';

export function sanitizeBody(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeBody);
  }

  const newObj: { [key: string]: any } = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerCaseKey = key.toLowerCase();

      if (SENSITIVE_KEYS.includes(lowerCaseKey)) {
        newObj[key] = '[MASKED]';
      } else {
        newObj[key] = sanitizeBody(obj[key]);
      }
    }
  }

  return newObj;
}
