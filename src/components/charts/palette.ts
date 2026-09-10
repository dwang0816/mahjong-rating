export const SERIES = ["#46c394", "#dfae4a", "#d9483f", "#5fa8e6", "#b985dc", "#e6845f", "#8fd3c7", "#c9b45c"];

export function seriesColor(i: number) {
  return SERIES[i % SERIES.length];
}
