export function missingProviderSymbols(symbols: string[], lookup: (symbol: string) => unknown) {
  return symbols.filter((symbol) => !lookup(symbol));
}
