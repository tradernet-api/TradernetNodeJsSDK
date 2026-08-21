import { OrderAction } from '../enums/OrderAction.js';
import {
  OrderExpiration,
  orderExpirationFromName,
} from '../enums/OrderExpiration.js';
import { OrderType } from '../enums/OrderType.js';
import { HttpMethod } from '../transport/HttpMethod.js';
import { BaseResource } from './BaseResource.js';

export class OrdersApi extends BaseResource {
  buy(
    ticker: string,
    quantity: number = 1,
    price = 0,
    duration = 'day',
    useMargin = false,
    userOrderId: number | null = null,
  ): Promise<Record<string, unknown>> {
    const action = useMargin ? OrderAction.BUY_MARGIN : OrderAction.BUY;
    return this.put(
      ticker,
      action,
      quantity,
      price,
      orderExpirationFromName(duration),
      userOrderId,
    );
  }

  cancel(orderId: number | string): Promise<Record<string, unknown>> {
    return this.call('delTradeOrder', { order_id: orderId }, HttpMethod.POST);
  }

  current(active = true): Promise<Record<string, unknown>> {
    return this.call('getNotifyOrderJson', { active }, HttpMethod.POST);
  }

  history(params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.call('getOrdersHistory', params, HttpMethod.POST);
  }

  put(
    ticker: string,
    action: OrderAction,
    quantity: number,
    price = 0,
    expiration: OrderExpiration = OrderExpiration.DAY,
    userOrderId: number | null = null,
  ): Promise<Record<string, unknown>> {
    if (quantity <= 0) {
      throw new Error('Order quantity must be positive');
    }
    if (price < 0) {
      throw new Error('Order price must be non-negative');
    }

    const params: Record<string, unknown> = {
      instr_name: ticker,
      action_id: action,
      order_type_id: price !== 0 ? OrderType.LIMIT : OrderType.MARKET,
      qty: quantity,
      limit_price: price,
      expiration_id: expiration,
    };
    if (userOrderId !== null) {
      params.user_order_id = userOrderId;
    }

    return this.call('putTradeOrder', params, HttpMethod.POST);
  }

  sell(
    ticker: string,
    quantity: number = 1,
    price = 0,
    duration = 'day',
    userOrderId: number | null = null,
  ): Promise<Record<string, unknown>> {
    return this.put(
      ticker,
      OrderAction.SELL,
      quantity,
      price,
      orderExpirationFromName(duration),
      userOrderId,
    );
  }

  short(
    ticker: string,
    quantity: number = 1,
    price = 0,
    duration = 'day',
    userOrderId: number | null = null,
  ): Promise<Record<string, unknown>> {
    return this.put(
      ticker,
      OrderAction.SELL_SHORT,
      quantity,
      price,
      orderExpirationFromName(duration),
      userOrderId,
    );
  }

  stopLoss(
    ticker: string,
    price: number,
    extra: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call(
      'putStopLoss',
      { instr_name: ticker, stop_loss: price, ...extra },
      HttpMethod.POST,
    );
  }

  tradesHistory(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    return this.call('getTradesHistory', params, HttpMethod.POST);
  }

  protected override requiresSid(): boolean {
    return false;
  }
}
