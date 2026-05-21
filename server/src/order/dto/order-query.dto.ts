import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../enum/order.enums';

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  /**
   * Початок діапазону за датою створення (ISO-8601 або YYYY-MM-DD).
   * Дата інклюзивна: 00:00:00 локального часу.
   */
  @IsOptional()
  @IsISO8601({ strict: false })
  dateFrom?: string;

  /**
   * Кінець діапазону за датою створення (ISO-8601 або YYYY-MM-DD).
   * Дата інклюзивна: до 23:59:59.999 локального часу.
   */
  @IsOptional()
  @IsISO8601({ strict: false })
  dateTo?: string;
}
