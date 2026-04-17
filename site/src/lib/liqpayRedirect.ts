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
