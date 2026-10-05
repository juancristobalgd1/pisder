export const cuota = (capital: number, tae: number, anios: number) => {
  const i = tae / 100 / 12, n = anios * 12;
  return i === 0 ? capital / n : (capital * i) / (1 - Math.pow(1 + i, -n));
};
