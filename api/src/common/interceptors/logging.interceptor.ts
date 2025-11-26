import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

function redact(value: any): any {
  const keys = ['password', 'token', 'authorization', 'secret', 'accessKeyId', 'secretAccessKey'];
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  const out: any = {};
  for (const k of Object.keys(value)) {
    const v = (value as any)[k];
    if (keys.includes(k.toLowerCase())) out[k] = '***';
    else out[k] = redact(v);
  }
  return out;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const start = Date.now();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const params = redact(req.params);
    const query = redact(req.query);
    const body = redact(req.body);
    const user = req.user ? { sub: req.user.sub, email: req.user.email, role: req.user.role } : undefined;
    this.logger.log(JSON.stringify({ type: 'request', method, url, params, query, body, user }));
    return next.handle().pipe(
      tap((data) => {
        const ms = Date.now() - start;
        const statusCode = res.statusCode;
        const out = redact(data);
        this.logger.log(JSON.stringify({ type: 'response', method, url, statusCode, durationMs: ms, result: out }));
      })
    );
  }
}

