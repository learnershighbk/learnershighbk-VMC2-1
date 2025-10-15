"use client";

import { formatWon } from "../lib/dto";
import { SEAT_CLASS_TABLE_HEADERS, CONCERT_DETAIL_MESSAGES } from "../constants";
import type { SeatClass } from "../lib/dto";

interface SeatClassSummaryTableProps {
  seatClasses: SeatClass[];
  isLoading?: boolean;
}

export function SeatClassSummaryTable({
  seatClasses,
  isLoading = false,
}: SeatClassSummaryTableProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-2">
        <h2 className="text-xl font-semibold">좌석 정보</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  {SEAT_CLASS_TABLE_HEADERS.GRADE}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  {SEAT_CLASS_TABLE_HEADERS.PRICE}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  {SEAT_CLASS_TABLE_HEADERS.TOTAL_SEATS}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  {SEAT_CLASS_TABLE_HEADERS.AVAILABLE_SEATS}
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (seatClasses.length === 0) {
    return (
      <div className="w-full space-y-2">
        <h2 className="text-xl font-semibold">좌석 정보</h2>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          {CONCERT_DETAIL_MESSAGES.EMPTY_SEAT_CLASSES}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <h2 className="text-xl font-semibold">좌석 정보</h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                {SEAT_CLASS_TABLE_HEADERS.GRADE}
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                {SEAT_CLASS_TABLE_HEADERS.PRICE}
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                {SEAT_CLASS_TABLE_HEADERS.TOTAL_SEATS}
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                {SEAT_CLASS_TABLE_HEADERS.AVAILABLE_SEATS}
              </th>
            </tr>
          </thead>
          <tbody>
            {seatClasses.map((seatClass) => {
              const isSoldOut = seatClass.availableSeats === 0;
              return (
                <tr
                  key={seatClass.id}
                  className={`border-t ${isSoldOut ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 font-medium">{seatClass.name}</td>
                  <td className="px-4 py-3 text-right">
                    {formatWon(seatClass.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {seatClass.totalSeats}석
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={isSoldOut ? "text-destructive" : ""}>
                      {seatClass.availableSeats}석
                      {isSoldOut && " (매진)"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

