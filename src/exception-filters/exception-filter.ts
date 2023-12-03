import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {

    try {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.getStatus();

      if (status === 400) {
        const errorResponse: { errorsMessages: any[] } = {
          errorsMessages: []
        }

        const responseBody: any = exception.getResponse()

        responseBody.forEach(message => {
          errorResponse.errorsMessages.push(message)
        })

        response.status(status).json(errorResponse)

      } else {
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url
        })
      }
    } catch {
      throw new Error('Something wrong in exception filter')
    }
  }
}