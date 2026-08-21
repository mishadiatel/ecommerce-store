'use client';

import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { Checkbox } from '@/components/admin/shadcnuiComponents/checkbox';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/admin/shadcnuiComponents/field';

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariantInput {
  sku: string;
  name?: string;
  attributes: VariantAttribute[];
  newPrice: number;
  oldPrice?: number;
  stock: number;
  outOfStock: boolean;
  isActive: boolean;
}

interface Props {
  stock: number;
  onStockChange: (v: number) => void;
  outOfStock: boolean;
  onOutOfStockChange: (v: boolean) => void;
  variants: ProductVariantInput[];
  onVariantsChange: (v: ProductVariantInput[]) => void;
}

const emptyVariant = (): ProductVariantInput => ({
  sku: '',
  name: '',
  attributes: [],
  newPrice: 0,
  oldPrice: undefined,
  stock: 0,
  outOfStock: false,
  isActive: true,
});

export default function VariantsEditor({
  stock,
  onStockChange,
  outOfStock,
  onOutOfStockChange,
  variants,
  onVariantsChange,
}: Props) {
  const t = useTranslations('variantsEditor');
  const tCommon = useTranslations('common');

  const updateVariant = (idx: number, patch: Partial<ProductVariantInput>) => {
    const next = variants.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    onVariantsChange(next);
  };

  const addVariant = () => {
    onVariantsChange([...variants, emptyVariant()]);
  };

  const removeVariant = (idx: number) => {
    onVariantsChange(variants.filter((_, i) => i !== idx));
  };

  const updateAttr = (
    vIdx: number,
    aIdx: number,
    patch: Partial<VariantAttribute>,
  ) => {
    const v = variants[vIdx];
    const nextAttrs = v.attributes.map((a, i) =>
      i === aIdx ? { ...a, ...patch } : a,
    );
    updateVariant(vIdx, { attributes: nextAttrs });
  };

  const addAttr = (vIdx: number) => {
    const v = variants[vIdx];
    updateVariant(vIdx, {
      attributes: [...v.attributes, { name: '', value: '' }],
    });
  };

  const removeAttr = (vIdx: number, aIdx: number) => {
    const v = variants[vIdx];
    updateVariant(vIdx, {
      attributes: v.attributes.filter((_, i) => i !== aIdx),
    });
  };

  const hasVariants = variants.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
      <div>
        <h4 className="font-semibold text-base">{t('title')}</h4>
        <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stock + outOfStock without variants */}
      {!hasVariants && (
        <FieldGroup>
          <Field>
            <FieldLabel>{t('productStockLabel')}</FieldLabel>
            <Input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => onStockChange(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t('stockHint')}</p>
          </Field>
          <Field>
            <div className="flex items-center gap-2 py-2">
              <Checkbox
                id="product-out-of-stock"
                checked={outOfStock}
                onCheckedChange={(v) => onOutOfStockChange(v === true)}
              />
              <label
                htmlFor="product-out-of-stock"
                className="text-sm cursor-pointer"
              >
                {t('outOfStockLabel')}
              </label>
            </div>
            <p className="text-xs text-muted-foreground">{t('outOfStockHint')}</p>
          </Field>
        </FieldGroup>
      )}

      {/* Variants list */}
      {variants.map((v, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-border p-3 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-muted-foreground">
              {t('variantN', { n: idx + 1 })}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeVariant(idx)}
              aria-label={tCommon('remove')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field>
              <FieldLabel>{t('sku')}</FieldLabel>
              <Input
                value={v.sku}
                placeholder="CAKE-CHOC-500G"
                onChange={(e) => updateVariant(idx, { sku: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>{t('displayName')}</FieldLabel>
              <Input
                value={v.name ?? ''}
                placeholder={t('displayNamePlaceholder')}
                onChange={(e) => updateVariant(idx, { name: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>{t('newPrice')}</FieldLabel>
              <Input
                type="number"
                min={0}
                value={v.newPrice}
                onChange={(e) =>
                  updateVariant(idx, { newPrice: Number(e.target.value) })
                }
              />
            </Field>
            <Field>
              <FieldLabel>{t('oldPrice')}</FieldLabel>
              <Input
                type="number"
                min={0}
                value={v.oldPrice ?? ''}
                onChange={(e) =>
                  updateVariant(idx, {
                    oldPrice: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field>
              <FieldLabel>{t('stock')}</FieldLabel>
              <Input
                type="number"
                min={0}
                value={v.stock}
                onChange={(e) =>
                  updateVariant(idx, { stock: Number(e.target.value) })
                }
              />
            </Field>
            <Field>
              <FieldLabel>{t('isActive')}</FieldLabel>
              <div className="flex items-center gap-2 py-2">
                <Checkbox
                  id={`variant-active-${idx}`}
                  checked={v.isActive}
                  onCheckedChange={(c) => updateVariant(idx, { isActive: c === true })}
                />
                <label
                  htmlFor={`variant-active-${idx}`}
                  className="text-sm cursor-pointer"
                >
                  {t('isActiveLabel')}
                </label>
              </div>
            </Field>
            <Field>
              <FieldLabel>{t('outOfStock')}</FieldLabel>
              <div className="flex items-center gap-2 py-2">
                <Checkbox
                  id={`variant-oos-${idx}`}
                  checked={v.outOfStock}
                  onCheckedChange={(c) => updateVariant(idx, { outOfStock: c === true })}
                />
                <label
                  htmlFor={`variant-oos-${idx}`}
                  className="text-sm cursor-pointer"
                >
                  {t('outOfStockLabel')}
                </label>
              </div>
            </Field>
          </div>

          {/* Attributes */}
          <div>
            <FieldLabel>{t('attributes')}</FieldLabel>
            <div className="flex flex-col gap-2 mt-2">
              {v.attributes.map((a, aIdx) => (
                <div key={aIdx} className="flex gap-2 items-center">
                  <Input
                    placeholder={t('attrName')}
                    value={a.name}
                    onChange={(e) => updateAttr(idx, aIdx, { name: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder={t('attrValue')}
                    value={a.value}
                    onChange={(e) => updateAttr(idx, aIdx, { value: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeAttr(idx, aIdx)}
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
                onClick={() => addAttr(idx)}
              >
                <Plus className="w-4 h-4 mr-1" /> {t('addAttr')}
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={addVariant}
      >
        <Plus className="w-4 h-4 mr-1" /> {t('addVariant')}
      </Button>
    </div>
  );
}
