"use client";

import { use } from "react";
import { ConcertDetailPageShell } from "@/features/concert-detail/components/ConcertDetailPageShell";

interface ConcertDetailPageProps {
  params: Promise<{
    concertId: string;
  }>;
}

export default function ConcertDetailPage({
  params,
}: ConcertDetailPageProps) {
  const { concertId } = use(params);

  return <ConcertDetailPageShell concertId={concertId} />;
}

