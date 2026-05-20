import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(OptionalAuthGuard)
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtUser | null) {
    return this.orderService.createOrder(user, dto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAllAdmin(@Query() query: OrderQueryDto) {
    return this.orderService.findAllOrdersAdmin(query);
  }

  @UseGuards(AccessTokenGuard)
  @Get('my')
  findMyOrders(@CurrentUser() user: JwtUser, @Query() query: OrderQueryDto) {
    return this.orderService.findMyOrders(String(user.sub), query);
  }

  @UseGuards(AccessTokenGuard)
  @Get('my/:id')
  findMyOrder(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.orderService.findMyOrderById(String(user.sub), id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOneAdmin(@Param('id') id: string) {
    return this.orderService.findOrderById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  updateStatusAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.status);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/mark-paid')
  markAsPaidAdmin(@Param('id') id: string) {
    return this.orderService.markAsPaid(id);
  }
}
