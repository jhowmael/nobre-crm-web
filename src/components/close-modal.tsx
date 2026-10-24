"use client";

import { brl, dateBR } from "@/lib/format";
import type { Opportunity } from "@/lib/types";
import { Button, Modal } from "./ui";

export function CloseModal({
  opp,
  pending,
  onConfirm,
  onClose,
  error,
}: {
  opp: Opportunity;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
  error?: string;
}) {
  return (
    <Modal
      title={`Fechar venda de ${opp.company}?`}
      description="Esta etapa é final e não pode ser desfeita."
      alert={error}
      onClose={onClose}
      onSubmit={() => {
        if (!pending) onConfirm();
      }}
      footer={
        <>
          <Button data-autofocus onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Fechando…" : "Confirmar fechamento"}
          </Button>
        </>
      }
    >
      <dl className="rounded-card bg-raised px-3.5 text-body">
        <div className="flex justify-between gap-4 border-b border-rule py-2.5">
          <dt className="text-ink-2">Código</dt>
          <dd className="font-mono font-medium">{opp.code}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-2.5">
          <dt className="text-ink-2">Valor estimado</dt>
          <dd className="font-medium tabular">{brl(opp.estimatedValue)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2.5">
          <dt className="text-ink-2">Evento do cliente</dt>
          <dd className="font-medium tabular">{dateBR(opp.eventDate)}</dd>
        </div>
      </dl>
    </Modal>
  );
}
