'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatEffectiveDate, formatDateTime } from '../lib/dto';

interface PolicyDocumentActionsProps {
  version: string;
  effectiveFrom: string | null;
  updatedAt: string;
}

export function PolicyDocumentActions({
  version,
  effectiveFrom,
  updatedAt,
}: PolicyDocumentActionsProps) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">버전:</span>
          <Badge variant="outline">{version}</Badge>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">시행일:</span>
          <span className="font-medium">{formatEffectiveDate(effectiveFrom)}</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">최종 업데이트:</span>
          <span className="font-medium">{formatDateTime(updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

