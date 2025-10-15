'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { FOOTER_SECTIONS, COMPANY_INFO } from '@/constants/footer';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="font-bold text-lg mb-2">{COMPANY_INFO.name}</h3>
            <p className="text-sm text-muted-foreground">
              {COMPANY_INFO.description}
            </p>
          </div>

          {Object.entries(FOOTER_SECTIONS).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} {COMPANY_INFO.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {FOOTER_SECTIONS.policy.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

