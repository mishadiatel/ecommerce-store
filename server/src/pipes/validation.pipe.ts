import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exceprion';

function isPrimitive(type: any): boolean {
  return [String, Boolean, Number, Array, Object].includes(type);
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const { metatype } = metadata;

    // ❗ Пропускаємо примітиви та якщо тип не заданий
    if (!metatype || isPrimitive(metatype)) {
      return value;
    }

    const obj = plainToInstance(metatype, value);
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
      throw new ValidationException({ errors: messages });
    }

    return obj; // 🟢 Повертаємо об'єкт, а не оригінальний value
  }
}
