'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { reservationMessages } from '../constants/messages';

interface ReservationCopyButtonProps {
  text: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ReservationCopyButton = ({
  text,
  label = reservationMessages.action.copyCode,
  variant = 'outline',
  size = 'sm',
}: ReservationCopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: reservationMessages.toast.copySuccess,
        variant: 'default',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: reservationMessages.toast.copyError,
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      aria-label={label}
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
};

