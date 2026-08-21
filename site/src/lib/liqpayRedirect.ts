/**
 * Submits a hidden POST form to LiqPay checkout URL, causing a top-level
 * navigation to the LiqPay hosted payment page.
 */
export function redirectToLiqPay(params: {
  data: string;
  signature: string;
  checkoutUrl: string;
}): void {
  if (typeof document === 'undefined') return;

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

/**
 * Відкриває LiqPay checkout у НОВОМУ вікні/вкладці, а поточну сторінку
 * залишає під контролем нашого сайту (щоб можна було полити статус і
 * автоматично показати success).
 *
 * Форма з `target="_blank"` спрацьовує в межах кліку користувача, тому
 * popup blocker її не блокує. Якщо браузер все ж не відкрив нову вкладку —
 * fallback на top-level redirect.
 */
export function openLiqPayInNewWindow(params: {
  data: string;
  signature: string;
  checkoutUrl: string;
}): boolean {
  if (typeof document === 'undefined') return false;

  // Даємо цільовому вікну ім'я — потім submitting кілька разів не буде
  // створювати нові вкладки, а буде перезаписувати ту саму (для retry).
  const targetName = 'liqpayCheckout';

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = params.checkoutUrl;
  form.acceptCharset = 'utf-8';
  form.target = targetName;

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

  // Перед submit пробуємо відкрити вкладку — щоб задетектити popup blocker
  const win = window.open('', targetName);
  const opened = Boolean(win);

  form.submit();
  form.remove();

  return opened;
}
