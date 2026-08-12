import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../enum/order.enums';

export class OrderQueryDto {
  @ApiPropertyOptional({
    description: 'Кількість замовлень на сторінку.',
    example: '20',
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Номер сторінки (починаючи з 1).',
    example: '1',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Пошук за email, ім’ям, прізвищем або номером телефону.',
    example: 'Петренко',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Фільтр за статусом замовлення.',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Фільтр за статусом оплати.',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Порядок сортування за датою створення: "asc" або "desc".',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: string;

  /**
   * Початок діапазону за датою створення (ISO-8601 або YYYY-MM-DD).
   * Дата інклюзивна: 00:00:00 локального часу.
   */
  @ApiPropertyOptional({
    description:
      'Початок діапазону за датою створення (ISO-8601 або YYYY-MM-DD). Дата інклюзивна: 00:00:00 локального часу.',
    example: '2025-01-15',
    format: 'date',
  })
  @IsOptional()
  @IsISO8601({ strict: false })
  dateFrom?: string;

  /**
   * Кінець діапазону за датою створення (ISO-8601 або YYYY-MM-DD).
   * Дата інклюзивна: до 23:59:59.999 локального часу.
   */
  @ApiPropertyOptional({
    description:
      'Кінець діапазону за датою створення (ISO-8601 або YYYY-MM-DD). Дата інклюзивна: до 23:59:59.999 локального часу.',
    example: '2025-01-31',
    format: 'date',
  })
  @IsOptional()
  @IsISO8601({ strict: false })
  dateTo?: string;
}
