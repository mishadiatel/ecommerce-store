'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { FullProductWithTranslations } from '@/types/product';

interface Props {
  products: FullProductWithTranslations[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}

/**
 * Пошук + вибір товару з підказками за slug'ом та назвою (перекладом).
 */
export default function ProductSearchSelect({
  products,
  value,
  onChange,
  placeholder,
  allowClear = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = products.find((p) => p._id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 100);
    return products
      .filter((p) => {
        const inSlug = p.slug?.toLowerCase().includes(q);
        const inTitle = p.translations?.some((t) =>
          t.title?.toLowerCase().includes(q),
        );
        return inSlug || inTitle;
      })
      .slice(0, 100);
  }, [products, query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const displayLabel = selected
    ? `${selected.translations?.[0]?.title ?? selected.slug} · ${selected.slug}`
    : (placeholder ?? '');

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full h-9 flex items-center justify-between gap-2 px-3 rounded-md border border-input bg-transparent text-sm hover:bg-accent/50"
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          {displayLabel || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {allowClear && selected && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук за slug або назвою..."
              className="w-full h-8 px-2 rounded-md border border-input bg-transparent text-sm outline-none"
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                —
              </div>
            ) : (
              filtered.map((p) => {
                const title = p.translations?.[0]?.title ?? p.slug;
                const isActive = p._id === value;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      onChange(p._id);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/60 flex items-start gap-2 ${
                      isActive ? 'bg-accent/40' : ''
                    }`}
                  >
                    {isActive ? (
                      <Check className="w-4 h-4 mt-0.5 text-primary" />
                    ) : (
                      <span className="w-4 h-4 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.slug}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
