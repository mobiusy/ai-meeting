import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const method = request.method;
    const url = request.originalUrl || request.url;
    const params = redact(request.params);
    const query = redact(request.query);
    const body = redact(request.body);
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception && typeof exception === 'object') {
      const anyEx = exception as any;
      message = anyEx.message || message;
    }
    const payload = { type: 'exception', method, url, statusCode: status, message, params, query, body };
    this.logger.error(JSON.stringify(payload));
    const responseBody: any = typeof message === 'object' ? message : { statusCode: status, message, error: HttpStatus[status] };
    response.status(status).json(responseBody);
  }
}

