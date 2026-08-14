import { RequestLog } from '@prisma/client';

export type CreateLogDto = Partial<Omit<RequestLog, 'id' | 'timestamp'>>;
