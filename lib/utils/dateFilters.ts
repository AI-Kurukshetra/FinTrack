const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const clampMonth = (month: number) => Math.min(12, Math.max(1, month));

const parseMonthInput = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) return numeric;
  const short = trimmed.slice(0, 3).toLowerCase();
  const index = monthLabels.findIndex((label) => label.toLowerCase() === short);
  return index >= 0 ? index + 1 : undefined;
};

const toTwo = (value: number) => String(value).padStart(2, "0");

export const formatMonthLabel = (year: number, month: number) =>
  `${monthLabels[clampMonth(month) - 1]} ${year}`;

export const toMonthParam = (year: number, month: number) =>
  `${year}-${toTwo(clampMonth(month))}`;

export const getMonthRange = (year: number, month: number) => {
  const safeMonth = clampMonth(month);
  const start = new Date(year, safeMonth - 1, 1);
  const end = new Date(year, safeMonth, 1);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

export const getReferenceDate = (year: number, month: number) => {
  const now = new Date();
  if (now.getFullYear() === year && now.getMonth() + 1 === clampMonth(month)) {
    return now;
  }
  return new Date(year, clampMonth(month), 0);
};

export const parseMonthYear = (params?: { m?: string; y?: string; month?: string; year?: string }) => {
  const now = new Date();
  const rawYear = params?.y ?? params?.year;
  const rawMonth = params?.m ?? params?.month;
  const parsedMonth = parseMonthInput(rawMonth);
  const year = Number(rawYear ?? now.getFullYear());
  const month = parsedMonth ?? Number(rawMonth ?? now.getMonth() + 1);

  const safeYear = Number.isFinite(year) && year > 2000 ? year : now.getFullYear();
  const safeMonth = Number.isFinite(month) ? clampMonth(month) : now.getMonth() + 1;

  return {
    year: safeYear,
    month: safeMonth,
    monthParam: toMonthParam(safeYear, safeMonth),
    label: formatMonthLabel(safeYear, safeMonth),
    range: getMonthRange(safeYear, safeMonth),
    referenceDate: getReferenceDate(safeYear, safeMonth),
  };
};

export const parseMonthYearParam = (monthYear: string) => {
  const [yearStr, monthStr] = monthYear.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  return parseMonthYear({
    y: Number.isFinite(year) ? String(year) : undefined,
    m: Number.isFinite(month) ? String(month) : undefined,
  });
};

export const getPreviousMonth = (year: number, month: number) => {
  const safeMonth = clampMonth(month);
  const date = new Date(year, safeMonth - 2, 1);
  const prevYear = date.getFullYear();
  const prevMonth = date.getMonth() + 1;
  return {
    year: prevYear,
    month: prevMonth,
    monthParam: toMonthParam(prevYear, prevMonth),
    label: formatMonthLabel(prevYear, prevMonth),
  };
};

export const getMonthSequence = (year: number, month: number, count: number) => {
  const safeMonth = clampMonth(month);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, safeMonth - 1 - index, 1);
    const seqYear = date.getFullYear();
    const seqMonth = date.getMonth() + 1;
    return {
      year: seqYear,
      month: seqMonth,
      monthParam: toMonthParam(seqYear, seqMonth),
      label: formatMonthLabel(seqYear, seqMonth),
    };
  });
};

export const getMonthOptions = (yearsBack = 2) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const years = Array.from({ length: yearsBack + 1 }, (_, index) => currentYear - index);
  return years.flatMap((year) =>
    monthLabels.map((label, idx) => ({
      value: toTwo(idx + 1),
      label: `${label} ${year}`,
      year,
    })),
  );
};

export const monthLabelByValue = (value: string) => {
  const index = Number(value) - 1;
  if (Number.isNaN(index) || index < 0 || index >= monthLabels.length) return monthLabels[0];
  return monthLabels[index];
};

export const monthOptions = monthLabels.map((label, idx) => ({
  value: toTwo(idx + 1),
  label,
}));
