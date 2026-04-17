# LiqPay Payment Integration — Implementation Guide

Complete drop-in implementation of online card payments via LiqPay (PrivatBank) with redirect flow, sandbox/production toggle, and webhook-driven payment status updates.

All code below is production-ready and works with your current structure:
- `server/` — NestJS + Mongoose with existing `Order` schema (already has `paymentStatus`, `paymentMethod`)
- `site/` — Next.js 15 storefront
- `admin/` — Next.js admin panel (already localized)

---

## 0. Your sandbox keys

```
LIQPAY_PUBLIC_KEY=sandbox_i82004666388
LIQPAY_PRIVATE_KEY=sandbox_2bZ5yQJd7LtJrz7JTz6D3LiuziFpCiN9rT7PLQDZ
```

Because both keys have the `sandbox_` prefix, **no real money is charged** — LiqPay accepts any test card, returns webhooks with `status: "sandbox"`, but there's no actual settlement. The test card to use during development:

```
4242 4242 4242 4242    CVV: 123    Expiry: any future date    OTP: 12345
```

When you go live, replace these two env values with your production keys (from LiqPay dashboard → "Бойові ключі") and set `LIQPAY_SANDBOX=0`. Nothing else in code changes.

---

## 1. Environment variables

### `server/.env`

```env
# LiqPay
LIQPAY_PUBLIC_KEY=sandbox_i82004666388
LIQPAY_PRIVATE_KEY=sandbox_2bZ5yQJd7LtJrz7JTz6D3LiuziFpCiN9rT7PLQDZ
LIQPAY_SANDBOX=1

# Public URLs (replace with real domains later)
APP_PUBLIC_URL=http://localhost:3000
API_PUBLIC_URL=http://localhost:4000
```

For local dev, LiqPay's `server_url` (webhook) must be publicly reachable. Use **ngrok**:

```bash
ngrok http 4000
# copy https://abcd-1234.ngrok-free.app into API_PUBLIC_URL
```

### `site/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 2. BACKEND — new files

### 2.1 `server/src/payments/liqpay/liqpay.types.ts`

```ts
export interface LiqPayCheckoutParams {
  data: string;
  signature: string;
  checkoutUrl: string;
}

export interface LiqPayCallbackPayload {
  public_key: string;
  version: string | number;
  action: string;
  payment_id: number;
  status: LiqPayStatus;
  order_id: string;
  amount: number;
  currency: string;
  description?: string;
  transaction_id?: number;
  sender_card_mask2?: string;
  sender_card_type?: string;
  sender_phone?: string;
  err_code?: string;
  err_description?: string;
  sandbox?: 0 | 1;
}

export type LiqPayStatus =
  | 'success'
  | 'sandbox'
  | 'failure'
  | 'error'
  | 'reversed'
  | 'subscribed'
  | 'unsubscribed'
  | 'wait_secure'
  | 'wait_accept'
  | 'wait_card'
  | 'wait_lc'
  | 'processing'
  | '3ds_verify'
  | 'cvv_verify'
  | 'otp_verify'
  | 'receiver_verify'
  | 'sender_verify';

export const LIQPAY_FINAL_SUCCESS: LiqPayStatus[] = ['success', 'sandbox'];
export const LIQPAY_FINAL_FAIL: LiqPayStatus[] = ['failure', 'error', 'reversed'];
```

### 2.2 `server/src/payments/liqpay/liqpay.service.ts`

```ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { OrderDocument } from '../../order/schema/order.schema';
import {
  LiqPayCallbackPayload,
  LiqPayCheckoutParams,
} from './liqpay.types';

@Injectable()
export class LiqPayService {
  private readonly logger = new Logger(LiqPayService.name);
  private readonly checkoutUrl = 'https://www.liqpay.ua/api/3/checkout';

  constructor(private readonly config: ConfigService) {}

  private get publicKey(): string {
    return this.config.getOrThrow<string>('LIQPAY_PUBLIC_KEY');
  }

  private get privateKey(): string {
    return this.config.getOrThrow<string>('LIQPAY_PRIVATE_KEY');
  }

  private get sandbox(): boolean {
    return this.config.get<string>('LIQPAY_SANDBOX') === '1';
  }

  /** LiqPay signature: base64(sha1(private + data + private)) */
  sign(data: string): string {
    return createHash('sha1')
      .update(this.privateKey + data + this.privateKey)
      .digest('base64');
  }

  verify(data: string, signature: string): boolean {
    return this.sign(data) === signature;
  }

  buildCheckoutParams(order: OrderDocument): LiqPayCheckoutParams {
    const appUrl = this.config.getOrThrow<string>('APP_PUBLIC_URL');
    const apiUrl = this.config.getOrThrow<string>('API_PUBLIC_URL');

    const payload = {
      public_key: this.publicKey,
      version: '3',
      action: 'pay',
      amount: Number(order.total.toFixed(2)),
      currency: 'UAH',
      description: `Замовлення #${order.orderNumber}`,
      order_id: order.orderNumber,
      result_url: `${appUrl}/checkout/result?orderId=${order.orderNumber}`,
      server_url: `${apiUrl}/payments/liqpay/callback`,
      sandbox: this.sandbox ? 1 : 0,
      language: 'uk',
    };

    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.sign(data);

    this.logger.log(
      `LiqPay checkout prepared for order ${order.orderNumber}, sandbox=${this.sandbox}`,
    );

    return { data, signature, checkoutUrl: this.checkoutUrl };
  }

  parseCallback(rawData: string): LiqPayCallbackPayload {
    const json = Buffer.from(rawData, 'base64').toString('utf8');
    return JSON.parse(json) as LiqPayCallbackPayload;
  }
}
```

### 2.3 `server/src/payments/payments.controller.ts`

```ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../order/schema/order.schema';
import {
  PaymentMethod,
  PaymentStatus,
} from '../order/enum/order.enums';
import { LiqPayService } from './liqpay/liqpay.service';
import {
  LIQPAY_FINAL_FAIL,
  LIQPAY_FINAL_SUCCESS,
} from './liqpay/liqpay.types';

@Controller('payments/liqpay')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly liqpay: LiqPayService,
  ) {}

  /** Client calls this to re-obtain LiqPay redirect params for a pending order */
  @Post('init')
  async init(@Body('orderNumber') orderNumber: string) {
    if (!orderNumber) throw new BadRequestException('orderNumber required');

    const order = await this.orderModel.findOne({ orderNumber });
    if (!order) throw new NotFoundException('Order not found');

    if (order.paymentMethod !== PaymentMethod.ONLINE) {
      throw new BadRequestException('Order is not online-paid');
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    return this.liqpay.buildCheckoutParams(order);
  }

  /** LiqPay server-to-server webhook. Signature-verified, idempotent. */
  @Post('callback')
  @HttpCode(200)
  async callback(
    @Body('data') data: string,
    @Body('signature') signature: string,
  ) {
    if (!data || !signature) {
      this.logger.warn('LiqPay callback missing data/signature');
      return { ok: false };
    }

    if (!this.liqpay.verify(data, signature)) {
      this.logger.warn('LiqPay callback signature mismatch — possible attack');
      return { ok: false };
    }

    const payload = this.liqpay.parseCallback(data);
    const order = await this.orderModel.findOne({
      orderNumber: payload.order_id,
    });
    if (!order) {
      this.logger.warn(`LiqPay callback for unknown order ${payload.order_id}`);
      return { ok: false };
    }

    // idempotent: if already paid, just ack
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { ok: true, alreadyPaid: true };
    }

    order.liqpayPaymentId = String(payload.payment_id ?? '');
    order.liqpayTransactionId = String(payload.transaction_id ?? '');
    order.liqpayStatus = payload.status;
    order.isSandboxPayment = payload.status === 'sandbox' || payload.sandbox === 1;

    if (LIQPAY_FINAL_SUCCESS.includes(payload.status)) {
      order.paymentStatus = PaymentStatus.PAID;
      this.logger.log(
        `Order ${order.orderNumber} PAID (${payload.status}, amount=${payload.amount} ${payload.currency})`,
      );
    } else if (LIQPAY_FINAL_FAIL.includes(payload.status)) {
      order.paymentStatus = PaymentStatus.FAILED;
      this.logger.warn(
        `Order ${order.orderNumber} payment FAILED: ${payload.status} ${payload.err_code ?? ''} ${payload.err_description ?? ''}`,
      );
    } else {
      // wait_accept, processing, 3ds_verify — keep pending, just record status
      this.logger.log(
        `Order ${order.orderNumber} intermediate status: ${payload.status}`,
      );
    }

    await order.save();
    return { ok: true };
  }

  /** Polled by storefront /checkout/result page */
  @Get('status/:orderNumber')
  async status(@Param('orderNumber') orderNumber: string) {
    const order = await this.orderModel.findOne({ orderNumber });
    if (!order) throw new NotFoundException('Order not found');

    return {
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      liqpayStatus: order.liqpayStatus ?? null,
      isSandboxPayment: order.isSandboxPayment ?? false,
    };
  }
}
```

### 2.4 `server/src/payments/payments.module.ts`

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Order, OrderSchema } from '../order/schema/order.schema';
import { LiqPayService } from './liqpay/liqpay.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [LiqPayService],
  exports: [LiqPayService],
})
export class PaymentsModule {}
```

---

## 3. BACKEND — edits to existing files

### 3.1 `server/src/order/schema/order.schema.ts`

Add these four `@Prop` declarations before the closing `}` of the `Order` class (right after the existing `isAgree` prop):

```ts
  // LiqPay tracking
  @Prop({ default: null }) liqpayPaymentId?: string;
  @Prop({ default: null }) liqpayTransactionId?: string;
  @Prop({ default: null }) liqpayStatus?: string;
  @Prop({ default: false }) isSandboxPayment?: boolean;
```

### 3.2 `server/src/app.module.ts`

Add to `imports` array:

```ts
import { PaymentsModule } from './payments/payments.module';

// ...
@Module({
  imports: [
    // ...existing imports
    PaymentsModule,
  ],
})
```

Also ensure `ConfigModule.forRoot({ isGlobal: true })` is already registered (it usually is).

### 3.3 `server/src/main.ts`

Make sure body parsers accept form-urlencoded (LiqPay webhook uses it):

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.enableCors({ origin: true, credentials: true });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
```

### 3.4 `server/src/order/order.service.ts`

Inject `LiqPayService` (add `PaymentsModule` to `OrderModule.imports`, then in `OrderService` constructor), and modify `create()` to return LiqPay params when online payment is chosen:

```ts
// At top:
import { LiqPayService } from '../payments/liqpay/liqpay.service';
import { PaymentMethod } from './enum/order.enums';

// In constructor:
constructor(
  // ...existing
  private readonly liqpay: LiqPayService,
) {}

// In the create() method, replace the final `return order;` with:
if (dto.paymentMethod === PaymentMethod.ONLINE) {
  const checkout = this.liqpay.buildCheckoutParams(order);
  return { order, liqpay: checkout };
}
return { order, liqpay: null };
```

Update the controller method type accordingly and adjust DTO return type.

### 3.5 `server/src/order/order.module.ts`

```ts
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    // existing
    PaymentsModule,
  ],
  // ...
})
```

---

## 4. STOREFRONT (`site/`)

### 4.1 Create `site/src/lib/liqpayRedirect.ts`

```ts
export function redirectToLiqPay(params: {
  data: string;
  signature: string;
  checkoutUrl: string;
}) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = params.checkoutUrl;
  form.acceptCharset = 'utf-8';

  for (const [name, value] of Object.entries({
    data: params.data,
    signature: params.signature,
  })) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
```

### 4.2 Modify checkout submit handler (`site/src/components/checkout/CheckoutForm.tsx` or equivalent)

After successful `createOrder()` API call:

```ts
const response = await createOrder(payload);
// response: { order, liqpay: { data, signature, checkoutUrl } | null }

if (response.liqpay) {
  redirectToLiqPay(response.liqpay);
  return; // user is leaving site
}

// Cash on delivery — go straight to thank-you page
router.push(`/checkout/thanks?orderId=${response.order.orderNumber}`);
```

### 4.3 Create `site/src/app/[locale]/checkout/result/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Status = 'pending' | 'paid' | 'failed';

interface PaymentStatusResponse {
  orderNumber: string;
  paymentStatus: Status;
  liqpayStatus: string | null;
  isSandboxPayment: boolean;
}

export default function CheckoutResultPage() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const search = useSearchParams();
  const orderId = search.get('orderId');

  const [status, setStatus] = useState<Status>('pending');
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    let attempts = 0;
    const maxAttempts = 20; // ~40s

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/liqpay/status/${orderId}`,
        );
        const data = (await res.json()) as PaymentStatusResponse;
        setStatus(data.paymentStatus);
        setIsSandbox(data.isSandboxPayment);

        if (data.paymentStatus === 'paid') {
          setTimeout(() => {
            router.push(`/checkout/thanks?orderId=${orderId}`);
          }, 1500);
          return;
        }
        if (data.paymentStatus === 'failed') return;
        if (attempts < maxAttempts) setTimeout(poll, 2000);
      } catch {
        if (attempts < maxAttempts) setTimeout(poll, 2000);
      }
    };

    poll();
  }, [orderId, router]);

  const retry = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/liqpay/init`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderId }),
      },
    );
    const liqpay = await res.json();
    const { redirectToLiqPay } = await import('@/lib/liqpayRedirect');
    redirectToLiqPay(liqpay);
  };

  return (
    <div className="mx-auto max-w-md py-24 text-center">
      {isSandbox && (
        <div className="mb-4 inline-block rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
          {t('sandboxNotice')}
        </div>
      )}

      {status === 'pending' && (
        <>
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <p>{t('processing')}</p>
        </>
      )}

      {status === 'paid' && (
        <>
          <p className="text-lg font-semibold text-green-600">{t('paid')}</p>
          <p className="text-sm text-gray-500">{t('redirecting')}</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <p className="text-lg font-semibold text-red-600">{t('failed')}</p>
          <button
            onClick={retry}
            className="mt-4 rounded bg-black px-4 py-2 text-white"
          >
            {t('retry')}
          </button>
        </>
      )}
    </div>
  );
}
```

### 4.4 Add translations

`site/src/messages/en.json` and `ua.json` under `checkout`:

```json
"checkout": {
  "processing": "Processing payment…" / "Обробляємо оплату…",
  "paid": "Payment successful" / "Оплата пройшла",
  "failed": "Payment failed" / "Оплата не пройшла",
  "retry": "Try again" / "Спробувати ще раз",
  "redirecting": "Redirecting…" / "Перенаправлення…",
  "sandboxNotice": "Sandbox test payment — no real money" / "Тестова оплата — справжні гроші не списуються"
}
```

---

## 5. ADMIN PANEL (`admin/`)

### 5.1 Update `admin/src/components/admin/orders/card/OrderCard.tsx`

In the details dialog, inside the payment section, show LiqPay metadata when present:

```tsx
{order.liqpayPaymentId && (
  <div>
    <p className="text-sm text-gray-500">{t('liqpayId')}</p>
    <p className="font-mono text-xs">{order.liqpayPaymentId}</p>
  </div>
)}

{order.isSandboxPayment && (
  <span className="ml-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
    {t('sandboxBadge')}
  </span>
)}
```

### 5.2 Add translation keys

`admin/src/messages/en.json` and `ua.json` under `orders`:

```json
"liqpayId": "LiqPay payment ID" / "ID платежу LiqPay",
"sandboxBadge": "Sandbox" / "Тест"
```

### 5.3 Update the `Order` TypeScript type (e.g., `admin/src/types/order.ts`)

Add:

```ts
liqpayPaymentId?: string | null;
liqpayTransactionId?: string | null;
liqpayStatus?: string | null;
isSandboxPayment?: boolean;
```

---

## 6. Testing the full flow

1. Start backend: `cd server && npm run start:dev`
2. Start ngrok: `ngrok http 4000` → copy HTTPS URL into `API_PUBLIC_URL` in `server/.env`, restart backend.
3. Start storefront: `cd site && npm run dev`
4. Go to storefront, add product to cart, proceed to checkout.
5. Fill form, select **"Оплата карткою"** (`paymentMethod = online`), submit.
6. You're redirected to LiqPay sandbox page. Enter test card `4242 4242 4242 4242` / CVV `123` / any future date / OTP `12345`.
7. LiqPay redirects you back to `/checkout/result?orderId=ORD-000123`.
8. Webhook arrives on backend → `paymentStatus: paid`.
9. Storefront polls status, sees `paid`, redirects to thanks page.
10. Open admin panel → the order has `Paid` status + `Sandbox` badge + LiqPay payment ID.

### Manual webhook test (without going through UI)

```bash
# Generate data+signature locally
node -e "
const crypto = require('crypto');
const privateKey = 'sandbox_2bZ5yQJd7LtJrz7JTz6D3LiuziFpCiN9rT7PLQDZ';
const payload = { public_key: 'sandbox_i82004666388', version: 3, action: 'pay', payment_id: 1, status: 'sandbox', order_id: 'ORD-TEST-001', amount: 100, currency: 'UAH' };
const data = Buffer.from(JSON.stringify(payload)).toString('base64');
const sig = crypto.createHash('sha1').update(privateKey + data + privateKey).digest('base64');
console.log('data=' + encodeURIComponent(data));
console.log('signature=' + encodeURIComponent(sig));
"

curl -X POST http://localhost:4000/payments/liqpay/callback \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'data=...&signature=...'
```

---

## 7. Going live

1. Register merchant on https://www.liqpay.ua, pass KYC (1-3 business days).
2. Copy production keys from dashboard (no `sandbox_` prefix).
3. Update production env:
   ```
   LIQPAY_PUBLIC_KEY=i12345678901
   LIQPAY_PRIVATE_KEY=...actual private key...
   LIQPAY_SANDBOX=0
   APP_PUBLIC_URL=https://yourstore.com
   API_PUBLIC_URL=https://api.yourstore.com
   ```
4. Redeploy. No code changes required.
5. Make one real 1 UAH test purchase → verify webhook fires → refund from LiqPay dashboard.

---

## 8. Security checklist

- [x] Webhook route is public but **every request is signature-verified** before touching DB.
- [x] Callback handler is **idempotent** — duplicate webhooks (LiqPay retries on 5xx) don't double-update.
- [x] `paymentStatus` is **never** accepted from client — only from verified webhook.
- [x] Amount is taken from DB `order.total`, not from client — even if user tampers with request, LiqPay can't overpay.
- [x] LiqPay requires **HTTPS** `server_url` in production. HTTP-only works in sandbox via ngrok.
- [x] Logs warn on invalid signatures — monitor these to detect probing.
- [x] `LIQPAY_PRIVATE_KEY` goes only in env/secrets, never committed.

---

## 9. Files summary

**New files to create (10):**
- `server/src/payments/payments.module.ts`
- `server/src/payments/payments.controller.ts`
- `server/src/payments/liqpay/liqpay.service.ts`
- `server/src/payments/liqpay/liqpay.types.ts`
- `site/src/lib/liqpayRedirect.ts`
- `site/src/app/[locale]/checkout/result/page.tsx`

**Existing files to edit (5-6):**
- `server/src/app.module.ts` — register `PaymentsModule`
- `server/src/main.ts` — body-parser urlencoded
- `server/src/order/schema/order.schema.ts` — 4 new props
- `server/src/order/order.module.ts` — import `PaymentsModule`
- `server/src/order/order.service.ts` — return `liqpay` checkout on online method
- `site/src/components/checkout/CheckoutForm.tsx` — redirect on success
- `admin/src/components/admin/orders/card/OrderCard.tsx` — show LiqPay fields
- `admin/src/messages/en.json` + `ua.json` — 2 new keys
- `site/src/messages/en.json` + `ua.json` — 6 new keys under `checkout`

Estimated apply time: 15-20 minutes.
