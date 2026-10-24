"use client";

import { useState } from "react";
import type { Opportunity } from "@/lib/types";
import { useCatalog } from "./app-data";
import { Button, Field, Modal, Select, Textarea } from "./ui";

export const LOSS_FIELDS = ["lossReasonCode", "lossNote", "to", "stage"] as const;

export interface LossInput {
  lossReasonCode: string;
  lossNote?: string;
}

export function LossModal({
  opp,
  pending,
  onConfirm,
  onClose,
  mode = "move",
  serverErrors = {},
}: {
  opp: Opportunity;
  mode?: "move" | "edit";
  pending: boolean;
  onConfirm: (input: LossInput) => void;
  onClose: () => void;
  serverErrors?: Record<string, string>;
}) {
  const catalog = useCatalog();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const reasonError = touched && !reason ? "Selecione um motivo para continuar." : serverErrors.lossReasonCode;

  const submit = () => {
    setTouched(true);
    if (!reason || pending) return;
    onConfirm(note.trim() ? { lossReasonCode: reason, lossNote: note.trim() } : { lossReasonCode: reason });
  };

  return (
    <Modal
      title={mode === "edit" ? "Registrar motivo da perda" : "Marcar como perdida"}
      description={
        mode === "edit"
          ? `${opp.company} (${opp.code}). A oportunidade continua em Perdida; só o motivo será registrado.`
          : `${opp.company} (${opp.code}). Essa ação é final e não pode ser desfeita.`
      }
      alert={serverErrors.to ?? serverErrors.stage}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Salvando…" : mode === "edit" ? "Salvar motivo" : "Confirmar perda"}
          </Button>
        </>
      }
    >
      <Field label="Motivo da perda" error={reasonError}>
        <Select data-autofocus value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={Boolean(reasonError)}>
          <option value="">Selecione…</option>
          {catalog.activeLossReasons.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Observação (opcional)" error={serverErrors.lossNote}>
        <Textarea
          value={note}
          maxLength={300}
          onChange={(event) => setNote(event.target.value)}
          aria-invalid={Boolean(serverErrors.lossNote)}
          placeholder="Algum detalhe que ajude a equipe a aprender com essa perda"
        />
      </Field>
    </Modal>
  );
}
