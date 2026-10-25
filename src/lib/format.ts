const money = (value: number | null, digits: number) =>
  value == null
    ? "Valor não informado"
    : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: digits, maximumFractionDigits: digits });

export const brl = (value: number | null) => money(value, 2);

export const brlCompact = (value: number | null) => money(value, 0);

export const dateBR = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "Não informado");

const DATE_TIME = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export const dateTimeBR = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const parts = Object.fromEntries(DATE_TIME.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.day}/${parts.month}/${parts.year} às ${parts.hour}:${parts.minute}`;
};

const utc = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export const daysBetween = (from: string, to: string) => Math.round((utc(to) - utc(from)) / 86_400_000);

export const addDays = (iso: string, days: number) => new Date(utc(iso) + days * 86_400_000).toISOString().slice(0, 10);

export const initial = (name: string) => name.slice(0, 1).toUpperCase();

export const firstName = (name: string) => name.split(" ")[0];

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const parseMoney = (text: string) => {
  const clean = text.replace(/[^\d,.-]/g, "");
  if (!clean) return NaN;
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : /^-?\d{1,3}(\.\d{3})+$/.test(clean)
      ? clean.replace(/\./g, "")
      : clean;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : NaN;
};
