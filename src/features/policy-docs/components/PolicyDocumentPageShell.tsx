'use client';

import { useMemo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePolicyDocumentQuery } from '../hooks/usePolicyDocumentQuery';
import { PolicyDocumentViewer } from './PolicyDocumentViewer';
import { PolicyDocumentToc } from './PolicyDocumentToc';
import { PolicyDocumentActions } from './PolicyDocumentActions';
import { buildHeadingIndex } from '../lib/utils';
import type { PolicyDocumentPayload } from '../backend/schema';

interface PolicyDocumentPageShellProps {
  slug: string;
}

export function PolicyDocumentPageShell({
  slug,
}: PolicyDocumentPageShellProps) {
  const { data, isLoading, isError, error, refetch } =
    usePolicyDocumentQuery(slug);

  const policyData = data as PolicyDocumentPayload | undefined;

  const headings = useMemo(() => {
    if (!policyData?.contentMarkdown) {
      return [];
    }
    return buildHeadingIndex(policyData.contentMarkdown);
  }, [policyData?.contentMarkdown]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded w-1/2" />
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="border rounded-lg p-8 bg-card text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold">문서를 불러올 수 없습니다</h1>
            <p className="text-muted-foreground">
              {error?.message || '문서를 찾을 수 없거나 접근할 수 없습니다.'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!policyData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{policyData.title}</h1>
          <PolicyDocumentActions
            version={policyData.version}
            effectiveFrom={policyData.effectiveFrom}
            updatedAt={policyData.updatedAt}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
          <div>
            <PolicyDocumentViewer
              contentMarkdown={policyData.contentMarkdown}
              title={policyData.title}
            />
          </div>

          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <PolicyDocumentToc headings={headings} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

