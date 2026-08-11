import { BacktestResult } from "@/lib/api";

export interface BacktestExportConfiguration {
  strategy: string;
  startDate: string;
  endDate: string;
  stockCodes: string[];
  initialCash: number;
}

export function createBacktestExport(result: BacktestResult, configuration: BacktestExportConfiguration) {
  const filename = `epsilon-backtest-${configuration.startDate}-to-${configuration.endDate}.json`;
  const content = JSON.stringify({
    format: "epsilon.backtest-result.v1",
    provenance: {
      configuration,
      resultOrigin: "backtest-service-response",
      data: {
        mode: "unknown",
        source: null,
        provider: null,
        samplingInterval: null,
        asOf: null,
      },
      executionAssumptions: {
        feeRate: null,
        minimumFee: null,
        slippagePerShare: null,
        fillModel: null,
        benchmark: null,
      },
    },
    result,
  }, null, 2);

  return { filename, content };
}

export function downloadBacktestResult(result: BacktestResult, configuration: BacktestExportConfiguration) {
  const { filename, content } = createBacktestExport(result, configuration);
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
