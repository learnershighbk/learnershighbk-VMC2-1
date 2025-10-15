'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { HeadingItem } from '../lib/utils';

interface PolicyDocumentTocProps {
  headings: HeadingItem[];
}

export function PolicyDocumentToc({ headings }: PolicyDocumentTocProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className="sticky top-20 space-y-2"
      aria-label="문서 목차"
    >
      <h2 className="font-semibold text-sm mb-4">목차</h2>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
          >
            <button
              type="button"
              onClick={() => handleClick(heading.id)}
              className={cn(
                'text-left w-full transition-colors hover:text-foreground',
                activeId === heading.id
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

