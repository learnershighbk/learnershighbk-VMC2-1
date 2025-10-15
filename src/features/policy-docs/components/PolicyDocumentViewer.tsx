'use client';

import { useEffect, useState } from 'react';
import { renderMarkdownToHtml } from '../lib/utils';

interface PolicyDocumentViewerProps {
  contentMarkdown: string;
  title: string;
}

export function PolicyDocumentViewer({
  contentMarkdown,
  title,
}: PolicyDocumentViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setIsRendering(true);
      try {
        const html = await renderMarkdownToHtml(contentMarkdown);
        if (!cancelled) {
          setHtmlContent(html);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to render markdown:', error);
          setHtmlContent('<p>문서를 렌더링하는 중 오류가 발생했습니다.</p>');
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [contentMarkdown]);

  if (isRendering) {
    return (
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <article
      className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20"
      aria-label={title}
    >
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </article>
  );
}

