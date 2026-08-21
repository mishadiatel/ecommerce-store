'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/admin/shadcnuiComponents/field';
import { LANGUAGES_LIST } from '@/variables/languages';
import { Contacts, ProductionAddress } from '@/types/contacts';
import {
  getContactsByLanguage,
  upsertContacts,
} from '@/services/contacts';

const emptyAddress = (): ProductionAddress => ({
  city: '',
  postcode: '',
  address: '',
});

const empty = (language: string): Contacts => ({
  language,
  salesTitle: '',
  phones: [],
  emails: [],
  productionTitle: '',
  productionAddresses: [],
  socialTitle: '',
  facebookUrl: '',
  instagramUrl: '',
  formTitle: '',
});

export default function ContactsForm() {
  const t = useTranslations('contactsPage');
  const tCommon = useTranslations('common');
  const [language, setLanguage] = useState<string>('ua');
  const [data, setData] = useState<Contacts>(empty('ua'));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getContactsByLanguage(language)
      .then((res) => {
        // Backward-compat: якщо старий документ ще має productionCity/... —
        // конвертуємо у одну адресу.
        const raw = (res ?? empty(language)) as Contacts & {
          productionCity?: string;
          productionPostcode?: string;
          productionAddress?: string;
        };
        let addresses = raw.productionAddresses ?? [];
        if (
          (!addresses || addresses.length === 0) &&
          (raw.productionCity || raw.productionPostcode || raw.productionAddress)
        ) {
          addresses = [
            {
              city: raw.productionCity ?? '',
              postcode: raw.productionPostcode ?? '',
              address: raw.productionAddress ?? '',
            },
          ];
        }
        setData({
          ...empty(language),
          ...raw,
          productionAddresses: addresses,
        });
      })
      .catch(() => toast.error(t('toast.loadError')))
      .finally(() => setIsLoading(false));
  }, [language, t]);

  const setField = <K extends keyof Contacts>(key: K, value: Contacts[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const setArrayItem = (
    key: 'phones' | 'emails',
    idx: number,
    value: string,
  ) => {
    setData((d) => {
      const next = [...(d[key] as string[])];
      next[idx] = value;
      return { ...d, [key]: next };
    });
  };

  const addArrayItem = (key: 'phones' | 'emails') => {
    setData((d) => ({ ...d, [key]: [...(d[key] as string[]), ''] }));
  };

  const removeArrayItem = (key: 'phones' | 'emails', idx: number) => {
    setData((d) => ({
      ...d,
      [key]: (d[key] as string[]).filter((_, i) => i !== idx),
    }));
  };

  // ── Виробничі адреси ────────────────────────────────────────
  const setAddressField = (
    idx: number,
    key: keyof ProductionAddress,
    value: string,
  ) => {
    setData((d) => {
      const next = [...d.productionAddresses];
      next[idx] = { ...next[idx], [key]: value };
      return { ...d, productionAddresses: next };
    });
  };

  const addAddress = () => {
    setData((d) => ({
      ...d,
      productionAddresses: [...d.productionAddresses, emptyAddress()],
    }));
  };

  const removeAddress = (idx: number) => {
    setData((d) => ({
      ...d,
      productionAddresses: d.productionAddresses.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleaned: Contacts = {
        ...data,
        language,
        phones: data.phones.map((p) => p.trim()).filter(Boolean),
        emails: data.emails.map((p) => p.trim()).filter(Boolean),
        productionAddresses: data.productionAddresses
          .map((a) => ({
            city: a.city.trim(),
            postcode: a.postcode.trim(),
            address: a.address.trim(),
          }))
          .filter((a) => a.city || a.postcode || a.address),
      };
      const res = await upsertContacts(cleaned);
      if (res) setData(res);
      toast.success(t('toast.saved'));
    } catch {
      toast.error(t('toast.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">
          {t('languageLabel')}
        </span>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES_LIST.map((l) => (
              <SelectItem key={l._id} value={l._id}>
                {l.text.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
            <h3 className="font-semibold text-base">{t('salesSection')}</h3>
            <FieldGroup>
              <Field>
                <FieldLabel>{t('salesTitle')}</FieldLabel>
                <Input
                  value={data.salesTitle}
                  onChange={(e) => setField('salesTitle', e.target.value)}
                />
              </Field>
            </FieldGroup>

            <div>
              <FieldLabel>{t('phones')}</FieldLabel>
              <div className="flex flex-col gap-2 mt-2">
                {data.phones.map((phone, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={phone}
                      placeholder="+38 (093) 041-94-48"
                      onChange={(e) => setArrayItem('phones', i, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('phones', i)}
                      aria-label={tCommon('remove')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => addArrayItem('phones')}
                >
                  <Plus className="w-4 h-4 mr-1" /> {t('addPhone')}
                </Button>
              </div>
            </div>

            <div>
              <FieldLabel>{t('emails')}</FieldLabel>
              <div className="flex flex-col gap-2 mt-2">
                {data.emails.map((email, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={email}
                      placeholder="info@example.com"
                      onChange={(e) => setArrayItem('emails', i, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('emails', i)}
                      aria-label={tCommon('remove')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => addArrayItem('emails')}
                >
                  <Plus className="w-4 h-4 mr-1" /> {t('addEmail')}
                </Button>
              </div>
            </div>
          </div>

          {/* Production */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
            <h3 className="font-semibold text-base">
              {t('productionSection')}
            </h3>
            <FieldGroup>
              <Field>
                <FieldLabel>{t('productionTitle')}</FieldLabel>
                <Input
                  value={data.productionTitle}
                  onChange={(e) =>
                    setField('productionTitle', e.target.value)
                  }
                />
              </Field>
            </FieldGroup>

            <div className="flex flex-col gap-3">
              <FieldLabel>{t('productionAddresses')}</FieldLabel>
              {data.productionAddresses.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  {t('noAddresses')}
                </div>
              )}
              {data.productionAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border p-3 flex flex-col gap-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase text-muted-foreground">
                      {t('addressN', { n: idx + 1 })}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAddress(idx)}
                      aria-label={tCommon('remove')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Field>
                    <FieldLabel>{t('productionCity')}</FieldLabel>
                    <Input
                      value={addr.city}
                      placeholder="м. Чернігів"
                      onChange={(e) =>
                        setAddressField(idx, 'city', e.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t('productionPostcode')}</FieldLabel>
                    <Input
                      value={addr.postcode}
                      placeholder="індекс: 14021"
                      onChange={(e) =>
                        setAddressField(idx, 'postcode', e.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t('productionAddress')}</FieldLabel>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                      value={addr.address}
                      onChange={(e) =>
                        setAddressField(idx, 'address', e.target.value)
                      }
                      placeholder={t('productionAddressPlaceholder')}
                    />
                  </Field>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={addAddress}
              >
                <Plus className="w-4 h-4 mr-1" /> {t('addAddress')}
              </Button>
            </div>
          </div>

          {/* Social */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
            <h3 className="font-semibold text-base">{t('socialSection')}</h3>
            <FieldGroup>
              <Field>
                <FieldLabel>{t('socialTitle')}</FieldLabel>
                <Input
                  value={data.socialTitle}
                  onChange={(e) => setField('socialTitle', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Facebook URL</FieldLabel>
                <Input
                  value={data.facebookUrl}
                  onChange={(e) => setField('facebookUrl', e.target.value)}
                  placeholder="https://www.facebook.com/..."
                />
              </Field>
              <Field>
                <FieldLabel>Instagram URL</FieldLabel>
                <Input
                  value={data.instagramUrl}
                  onChange={(e) => setField('instagramUrl', e.target.value)}
                  placeholder="https://www.instagram.com/..."
                />
              </Field>
            </FieldGroup>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
            <h3 className="font-semibold text-base">{t('formSection')}</h3>
            <FieldGroup>
              <Field>
                <FieldLabel>{t('formTitle')}</FieldLabel>
                <Input
                  value={data.formTitle}
                  onChange={(e) => setField('formTitle', e.target.value)}
                />
              </Field>
            </FieldGroup>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading || isSaving}>
          {isSaving ? tCommon('saving') : tCommon('saveChanges')}
        </Button>
      </div>
    </div>
  );
}
