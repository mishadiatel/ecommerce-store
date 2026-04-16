import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enum/order.enums';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
