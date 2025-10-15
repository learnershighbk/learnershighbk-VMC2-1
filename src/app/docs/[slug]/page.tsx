'use client';

import { use } from 'react';
import { PolicyDocumentPageShell } from '@/features/policy-docs/components/PolicyDocumentPageShell';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DocsSlugPage({ params }: PageProps) {
  const { slug } = use(params);

  return <PolicyDocumentPageShell slug={slug} />;
}

