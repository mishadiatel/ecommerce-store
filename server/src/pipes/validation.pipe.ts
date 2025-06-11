import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exceprion';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata.metatype) {
      const obj = plainToInstance(metadata.metatype, value);
      const errors = await validate(obj);
      if (errors.length) {
        const messages = errors.map((err) => {
          const constraints = err.constraints
            ? Object.values(err.constraints).join(', ')
            : 'Validation error';
          return {
            [err.property]: constraints,
          };
        });
        throw new ValidationException({
          errors: messages,
        });
      }
    }
    return value;
  }
}
