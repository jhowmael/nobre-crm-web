"use client";

import { useState } from "react";
import { parseMoney } from "@/lib/format";
import type { NewOpportunityInput } from "@/lib/types";
import { useSellers } from "./app-data";
import { Button, Field, Input, Modal, Select } from "./ui";

export const NEW_FIELDS = ["company", "sellerId", "items", "estimatedValue", "eventDate"] as const;

export function NewModal({
  defaultSellerId,
  onCreate,
  onClose,
  pending,
  serverErrors = {},
}: {
  defaultSellerId: string | null;
  onCreate: (input: NewOpportunityInput) => void;
  onClose: () => void;
  pending: boolean;
  serverErrors?: Record<string, string>;
}) {
  const sellers = useSellers();
  const [company, setCompany] = useState("");
  const [sellerId, setSellerId] = useState(
    defaultSellerId && sellers.some((seller) => seller.id === defaultSellerId) ? defaultSellerId : (sellers[0]?.id ?? ""),
  );
  const [gift, setGift] = useState("");
  const [quantity, setQuantity] = useState("");
  const [value, setValue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [touched, setTouched] = useState(false);

  const parsed = parseMoney(value);
  const hasGift = gift.trim() !== "";
  const hasQuantity = Number(quantity) > 0;
  const companyError = company.trim() ? undefined : "Informe o nome da empresa.";
  const sellerError = sellerId ? undefined : "Selecione o vendedor.";
  const giftError = !hasGift && hasQuantity ? "Informe o brinde para essa quantidade." : undefined;
  const quantityError = hasGift && !hasQuantity ? "Informe a quantidade." : undefined;
  const valueError = value.trim() && !(parsed > 0) ? "Informe um valor maior que zero ou deixe em branco." : undefined;
  const show = (error: string | undefined, field: string) => (touched ? error : undefined) ?? serverErrors[field];

  const submit = () => {
    setTouched(true);
    if (companyError || sellerError || giftError || quantityError || valueError || pending) return;
    const input: NewOpportunityInput = { company: company.trim(), sellerId };
    if (hasGift && hasQuantity) input.items = [{ name: gift.trim(), quantity: Number(quantity) }];
    if (parsed > 0) input.estimatedValue = Math.round(parsed * 100) / 100;
    if (eventDate) input.eventDate = eventDate;
    onCreate(input);
  };

  return (
    <Modal
      title="Nova oportunidade"
      description="Entra em Primeiro Contato. Valor e brinde podem ser preenchidos depois, mas são exigidos para gerar o orçamento."
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Criando…" : "Criar oportunidade"}
          </Button>
        </>
      }
    >
      <Field label="Empresa" error={show(companyError, "company")}>
        <Input
          data-autofocus
          value={company}
          maxLength={160}
          onChange={(event) => setCompany(event.target.value)}
          aria-invalid={Boolean(show(companyError, "company"))}
        />
      </Field>
      <Field label="Vendedor" error={show(sellerError, "sellerId")}>
        <Select value={sellerId} onChange={(event) => setSellerId(event.target.value)} aria-invalid={Boolean(show(sellerError, "sellerId"))}>
          {sellers.map((seller) => (
            <option key={seller.id} value={seller.id}>
              {seller.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_6rem] sm:gap-2">
        <Field label="Brinde (opcional)" error={show(giftError, "items")}>
          <Input
            value={gift}
            maxLength={120}
            onChange={(event) => setGift(event.target.value)}
            placeholder="Ex.: Agenda"
            aria-invalid={Boolean(show(giftError, "items"))}
          />
        </Field>
        <Field label="Qtd." error={touched ? quantityError : undefined}>
          <Input
            inputMode="numeric"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value.replace(/\D/g, ""))}
            aria-invalid={touched && Boolean(quantityError)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-2">
        <Field label="Valor estimado (R$)" error={show(valueError, "estimatedValue")}>
          <Input
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="0,00"
            aria-invalid={Boolean(show(valueError, "estimatedValue"))}
          />
        </Field>
        <Field label="Data do evento" error={show(undefined, "eventDate")}>
          <Input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} aria-invalid={Boolean(show(undefined, "eventDate"))} />
        </Field>
      </div>
    </Modal>
  );
}
