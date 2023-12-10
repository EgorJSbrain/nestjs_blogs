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
      const responseBody: any = exception.getResponse()

      if (status === 400) {
        const errorResponse: { errorsMessages: any[] } = {
          errorsMessages: []
        }

        if (!!responseBody.error) {
          responseBody.message.forEach(message => {
            errorResponse.errorsMessages.push(message)
          })
        } else {
          errorResponse.errorsMessages.push(responseBody)
        }

        response.status(status).json(errorResponse)

      } else {
        response.status(status).json({
          errorsMessages: [responseBody]
        })
      }
    } catch {
      throw new Error('Something wrong in exception filter')
    }
  }
}