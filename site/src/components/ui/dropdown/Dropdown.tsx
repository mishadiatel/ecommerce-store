'use client';

import React, { useState, useRef, useEffect, ReactNode, KeyboardEvent } from 'react';

type DropdownProps<T> = {
  children: (props: {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    open: () => void;
    selected?: T;
    setSelected: (item: T) => void;
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    listRef: React.RefObject<HTMLUListElement | null>;
  }) => ReactNode;
  dropdownContainerClass?: string;
  options: T[];
  initialSelected?: T;
  onSelect?: (item: T) => void;
  initialOpenState?: boolean;
  disableAutoClose?: boolean;
};

export function Dropdown<T>({
                              children,
                              options,
                              initialSelected,
                              onSelect,
  dropdownContainerClass,
  initialOpenState = false,
  disableAutoClose = false,
                            }: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(initialOpenState);
  const [selected, setSelected] = useState<T | undefined>(initialSelected);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const toggle = () => setIsOpen((open) => !open);
  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    }
    function handleScroll() {
      close();
    }
    if(!disableAutoClose) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if(!disableAutoClose) {
        document.removeEventListener('click', handleClickOutside);
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex((idx) => (idx < options.length - 1 ? idx + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedIndex((idx) => (idx > 0 ? idx - 1 : options.length - 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (focusedIndex >= 0) {
        const selectedItem = options[focusedIndex];
        setSelected(selectedItem);
        onSelect?.(selectedItem);
        close();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      className={`dropdown-container ${dropdownContainerClass ? dropdownContainerClass : ''}`}
    >
      {children({
        isOpen,
        toggle,
        close,
        open,
        selected,
        setSelected: (item) => {
          setSelected(item);
          onSelect?.(item);
        },
        focusedIndex,
        setFocusedIndex,
        listRef,
      })}
    </div>
  );
}
