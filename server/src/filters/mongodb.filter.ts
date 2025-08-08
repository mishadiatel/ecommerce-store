import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch(MongoError, MongooseError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError | MongooseError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal MongoDB error';
    const detail = exception.message;

    switch (true) {
      // Mongoose validation error
      case exception instanceof MongooseError.ValidationError:
        status = HttpStatus.BAD_REQUEST;
        message = 'Validation failed';
        break;

      // Duplicate key error (e.g. unique field)
      case (exception as any).code === 11000:
        status = HttpStatus.CONFLICT;
        message = 'Duplicate key error';
        break;

      // Cast error (e.g. invalid ObjectId)
      case exception instanceof MongooseError.CastError:
        status = HttpStatus.BAD_REQUEST;
        message = `Invalid value for field: ${(exception as MongooseError.CastError).path}`;
        break;

      // Mongo connection error
      case exception.name === 'MongoServerSelectionError':
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Cannot connect to MongoDB';
        break;

      // Indexing or schema conflict
      case exception.name === 'MongoError' &&
        exception.message?.includes('index'):
        status = HttpStatus.BAD_REQUEST;
        message = 'Indexing conflict';
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      detail,
    });
  }
}
