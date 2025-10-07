export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const truncateLabel = (label: string, maxLength: number = 10) => {
  if (label.length > maxLength) {
    return `${label.substring(0, maxLength)}...`;
  }
  return label;
};