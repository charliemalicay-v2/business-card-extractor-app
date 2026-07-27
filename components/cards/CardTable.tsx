"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/cards/StatusBadge";
import type { CardListItem } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

export function CardTable({ items }: { items: CardListItem[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.id}
            tabIndex={0}
            onClick={() => router.push(`/cards/${item.id}`)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(`/cards/${item.id}`);
              }
            }}
            className="cursor-pointer"
          >
            <TableCell>{item.fields.name.value ?? "—"}</TableCell>
            <TableCell>{item.fields.company.value ?? "—"}</TableCell>
            <TableCell>{item.fields.email.value ?? "—"}</TableCell>
            <TableCell>
              <StatusBadge status={item.status} />
            </TableCell>
            <TableCell>{dateFormatter.format(new Date(item.updated_at))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
