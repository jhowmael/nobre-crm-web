"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { dateBR, parseMoney } from "@/lib/format";
import type { GiftItemInput, Opportunity } from "@/lib/types";
import { useCatalog } from "./app-data";
import { Button, Field, Input, Modal } from "./ui";

export const COMPLETE_FIELDS = ["estimatedValue", "items", "proposalValidUntil", "to"] as const;

export interface CompleteInput {
  estimatedValue: number;
  items: GiftItemInput[];
  proposalValidUntil: string;
}

interface Row {
  name: string;
  quantity: string;
}

export function CompleteModal({
  opp,
  pending,
  onConfirm,
  onClose,
  serverErrors = {},
}: {
  opp: Opportunity;
  pending: boolean;
  onConfirm: (data: CompleteInput) => void;
  onClose: () => void;
  serverErrors?: Record<string, string>;
}) {
  const { today, inDays } = useCatalog();
  const [value, setValue] = useState(opp.estimatedValue ? String(opp.estimatedValue).replace(".", ",") : "");
  const [rows, setRows] = useState<Row[]>(
    opp.items.length > 0 ? opp.items.map((item) => ({ name: item.name, quantity: String(item.quantity) })) : [{ name: "", quantity: "" }],
  );
  const [validUntil, setValidUntil] = useState(
    opp.proposalValidUntil && opp.proposalValidUntil >= today ? opp.proposalValidUntil : inDays(7),
  );
  const [touched, setTouched] = useState(false);

  const parsedValue = parseMoney(value);
  const valueError = !value.trim() || !(parsedValue > 0) ? "Informe um valor estimado maior que zero." : undefined;
  const validRows = rows.filter((row) => row.name.trim() && Number(row.quantity) > 0);
  const partialRow = rows.some((row) => Boolean(row.name.trim()) !== Number(row.quantity) > 0);
  const itemsError =
    validRows.length === 0
      ? "Informe ao menos um item com nome e quantidade."
      : partialRow
        ? "Cada item precisa de nome e quantidade."
        : undefined;

  const validityError = !validUntil
    ? "Informe a validade da proposta."
    : validUntil < today
      ? `A validade não pode ser anterior a hoje (${dateBR(today)}).`
      : undefined;
  const validityHint =
    opp.eventDate && validUntil > opp.eventDate
      ? `Atenção: a validade passa da data do evento (${dateBR(opp.eventDate)}).`
      : `Padrão: 7 dias a partir de hoje (${dateBR(today)}).`;

  const shownValueError = (touched ? valueError : undefined) ?? serverErrors.estimatedValue;
  const shownItemsError = (touched ? itemsError : undefined) ?? serverErrors.items;
  const shownValidityError = (touched ? validityError : undefined) ?? serverErrors.proposalValidUntil;

  const update = (index: number, patch: Partial<Row>) => setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const submit = () => {
    setTouched(true);
    if (valueError || itemsError || validityError || pending) return;
    onConfirm({
      proposalValidUntil: validUntil,
      estimatedValue: Math.round(parsedValue * 100) / 100,
      items: validRows.map((row) => ({ name: row.name.trim(), quantity: Number(row.quantity) })),
    });
  };

  return (
    <Modal
      title="Completar dados do orçamento"
      description={`Para avançar ${opp.company} para Apresentação de Orçamento, informe o valor estimado, ao menos um brinde e a validade da proposta.`}
      alert={serverErrors.to}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Salvando…" : "Salvar e avançar"}
          </Button>
        </>
      }
    >
      <Field label="Valor estimado (R$)" error={shownValueError}>
        <Input data-autofocus inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="0,00" aria-invalid={Boolean(shownValueError)} />
      </Field>
      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-1.5 text-body font-medium">Itens de brinde</legend>
        {rows.map((row, index) => (
          <div key={index} className="flex min-w-0 items-center gap-2">
            <Input
              aria-label={`Nome do brinde ${index + 1}`}
              placeholder="Ex.: Caneca personalizada"
              className="min-w-0"
              value={row.name}
              onChange={(event) => update(index, { name: event.target.value })}
            />
            <div className="w-20 shrink-0">
              <Input
                aria-label={`Quantidade do brinde ${index + 1}`}
                inputMode="numeric"
                placeholder="Qtd."
                value={row.quantity}
                onChange={(event) => update(index, { quantity: event.target.value.replace(/\D/g, "") })}
              />
            </div>
            <Button
              variant="plain"
              size="icon"
              aria-label={`Remover brinde ${index + 1}`}
              disabled={rows.length === 1}
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
        ))}
        {shownItemsError && (
          <span role="alert" className="text-caption text-negative">
            {shownItemsError}
          </span>
        )}
        <Button className="self-start" onClick={() => setRows((current) => [...current, { name: "", quantity: "" }])}>
          <Plus size={16} aria-hidden="true" /> Adicionar item
        </Button>
      </fieldset>
      <Field label="Validade da proposta" error={shownValidityError} hint={validityHint}>
        <Input
          type="date"
          required
          min={today}
          value={validUntil}
          onChange={(event) => setValidUntil(event.target.value)}
          aria-invalid={Boolean(shownValidityError)}
        />
      </Field>
    </Modal>
  );
}
