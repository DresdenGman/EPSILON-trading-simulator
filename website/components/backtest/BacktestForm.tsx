"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { api, type BacktestRequest, type BacktestResult } from "@/lib/api";
import { GUEST_MODE } from "@/lib/guest-mode";
import { downloadBacktestResult, type BacktestExportConfiguration } from "@/lib/backtest-export";
import {
  GUEST_BACKTEST_PROVENANCE,
  SERVICE_BACKTEST_PROVENANCE,
  useResearchExperiment,
} from "@/components/research/ResearchContext";
import EvidencePlate from "@/components/evidence/EvidencePlate";
import {
  createEvidenceArtifact,
  decodePortableEvidenceArtifact,
  snapshotBacktest,
  type EvidenceArtifact,
  type EvidenceObservation,
} from "@/lib/evidence-artifact";

function normalizeStockCodes(value: string) {
  return Array.from(new Set(value.split(",").map((code) => code.trim().toUpperCase()).filter(Boolean)));
}

function shiftDate(date: string, days: number) {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function isBacktestResult(value: unknown): value is BacktestResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<BacktestResult>;
  const performance = candidate.performance as Partial<BacktestResult["performance"]> | undefined;
  const finite = (number: unknown) => typeof number === "number" && Number.isFinite(number);
  return typeof candidate.strategy_name === "string" && candidate.strategy_name.length <= 120 &&
    Boolean(performance) && finite(performance?.total_return) && finite(performance?.cagr) &&
    finite(performance?.sharpe) && finite(performance?.max_drawdown) && finite(performance?.win_rate) &&
    finite(performance?.profit_factor) && Array.isArray(candidate.trades) && candidate.trades.length <= 5_000 &&
    candidate.trades.every((trade) => trade && typeof trade.date === "string" && typeof trade.stock_code === "string" &&
      typeof trade.stock_name === "string" && typeof trade.trade_type === "string" && finite(trade.shares) &&
      finite(trade.price) && finite(trade.total_amount)) && Array.isArray(candidate.equity_curve) &&
    candidate.equity_curve.length <= 2_400 && candidate.equity_curve.every((point) =>
      point && typeof point.date === "string" && finite(point.equity));
}

type SubmittedConfiguration = BacktestExportConfiguration & {
  feeRate: number;
  minimumFee: number;
  slippagePerShare: number;
};

type PerturbationDefinition = {
  id: string;
  label: string;
  parameter: EvidenceObservation["parameter"];
  baselineValue: string;
  perturbedValue: string;
  request: BacktestRequest;
};

function configurationsMatch(left: SubmittedConfiguration, right: SubmittedConfiguration) {
  return left.strategy === right.strategy && left.startDate === right.startDate && left.endDate === right.endDate &&
    left.initialCash === right.initialCash && left.feeRate === right.feeRate && left.minimumFee === right.minimumFee &&
    left.slippagePerShare === right.slippagePerShare && left.stockCodes.join(",") === right.stockCodes.join(",");
}

function buildPerturbations(configuration: SubmittedConfiguration): PerturbationDefinition[] {
  const base: BacktestRequest = {
    strategy: configuration.strategy,
    start_date: configuration.startDate,
    end_date: configuration.endDate,
    stock_codes: configuration.stockCodes,
    initial_cash: configuration.initialCash,
    fee_rate: configuration.feeRate,
    min_fee: configuration.minimumFee,
    slippage_per_share: configuration.slippagePerShare,
  };
  const candidateStart = shiftDate(configuration.startDate, 30);
  const shiftedStart = candidateStart < configuration.endDate ? candidateStart : shiftDate(configuration.startDate, 1);
  const narrowedUniverse = configuration.stockCodes.slice(0, -1);
  return [
    {
      id: "fee-5x", label: "Fee ×5", parameter: "fee_rate", baselineValue: String(configuration.feeRate),
      perturbedValue: String(configuration.feeRate * 5), request: { ...base, fee_rate: configuration.feeRate * 5 },
    },
    {
      id: "slippage-5x", label: "Slippage ×5", parameter: "slippage_per_share", baselineValue: `$${configuration.slippagePerShare}`,
      perturbedValue: `$${configuration.slippagePerShare * 5}`, request: { ...base, slippage_per_share: configuration.slippagePerShare * 5 },
    },
    {
      id: "window-plus-30", label: "Window +30d", parameter: "start_date", baselineValue: configuration.startDate,
      perturbedValue: shiftedStart, request: { ...base, start_date: shiftedStart },
    },
    configuration.stockCodes.length > 1
      ? {
          id: "universe-narrow", label: "Narrow universe", parameter: "stock_codes" as const,
          baselineValue: configuration.stockCodes.join(","), perturbedValue: narrowedUniverse.join(","),
          request: { ...base, stock_codes: narrowedUniverse },
        }
      : {
          id: "minimum-fee-5x", label: "Minimum fee ×5", parameter: "minimum_fee" as const,
          baselineValue: `$${configuration.minimumFee}`, perturbedValue: `$${configuration.minimumFee * 5}`,
          request: { ...base, min_fee: configuration.minimumFee * 5 },
        },
  ];
}

export default function BacktestForm() {
  const { experiment, hydrated, testState, setHypothesis, setFalsification, recordBacktest } = useResearchExperiment();
  const searchParams = useSearchParams();
  const [strategy, setStrategy] = React.useState("momentum");
  const [startDate, setStartDate] = React.useState("2024-01-01");
  const [endDate, setEndDate] = React.useState("2024-06-30");
  const [stockCodes, setStockCodes] = React.useState("AAPL,MSFT,GOOGL");
  const [initialCash, setInitialCash] = React.useState(100000);
  const [feeRate, setFeeRate] = React.useState(0.0001);
  const [minimumFee, setMinimumFee] = React.useState(1);
  const [slippagePerShare, setSlippagePerShare] = React.useState(0.01);
  const [loading, setLoading] = React.useState(false);
  const [runningStage, setRunningStage] = React.useState("");
  const [result, setResult] = React.useState<BacktestResult | null>(null);
  const [evidenceArtifact, setEvidenceArtifact] = React.useState<EvidenceArtifact | null>(null);
  const [successfulConfiguration, setSuccessfulConfiguration] = React.useState<SubmittedConfiguration | null>(null);
  const [error, setError] = React.useState("");
  const restoredRef = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated || restoredRef.current) return;
    restoredRef.current = true;
    let active = true;
    const restore = async () => {
      const imported = await decodePortableEvidenceArtifact(searchParams.get("artifact") ?? "");
      if (!active) return;
      if (imported) {
      setHypothesis(imported.claim);
      setFalsification(imported.falsifiedIf);
      setStrategy(imported.configuration.strategy);
      setStartDate(imported.configuration.startDate);
      setEndDate(imported.configuration.endDate);
      setStockCodes(imported.configuration.stockCodes.join(","));
      setInitialCash(imported.configuration.initialCash);
      setFeeRate(imported.configuration.feeRate);
      setMinimumFee(imported.configuration.minimumFee);
      setSlippagePerShare(imported.configuration.slippagePerShare);
      setEvidenceArtifact(imported);
      return;
      }
      const transferred = normalizeStockCodes(searchParams.get("symbols") ?? "");
      if (experiment.test) {
      const configuration = experiment.test.perturbationEvidence?.configuration;
      setStrategy(experiment.test.strategy);
      setStartDate(experiment.test.startDate);
      setEndDate(experiment.test.endDate);
      setStockCodes((transferred.length ? transferred : experiment.test.symbols).join(","));
      setInitialCash(experiment.test.initialCash);
      setFeeRate(configuration?.feeRate ?? 0.0001);
      setMinimumFee(configuration?.minimumFee ?? 1);
      setSlippagePerShare(configuration?.slippagePerShare ?? 0.01);
      if (experiment.test.result) setResult(experiment.test.result);
      if (experiment.test.perturbationEvidence) setEvidenceArtifact(experiment.test.perturbationEvidence);
      else if (experiment.test.result) {
        setEvidenceArtifact(createEvidenceArtifact({
          claim: experiment.hypothesis || "Saved strategy result",
          falsifiedIf: experiment.falsification || "No rejection rule was recorded for this legacy result.",
          configuration: {
            strategy: experiment.test.strategy, startDate: experiment.test.startDate, endDate: experiment.test.endDate,
            stockCodes: experiment.test.symbols, initialCash: experiment.test.initialCash,
            feeRate: 0.0001, minimumFee: 1, slippagePerShare: 0.01,
          },
          baseline: snapshotBacktest(experiment.test.result), observations: [],
          provenance: {
            resultOrigin: experiment.test.provenance.resultOrigin,
            dataMode: "controlled-synthetic",
            dataSource: experiment.test.provenance.dataSource ?? "Legacy EPSILON result; source was not recorded",
            samplingInterval: experiment.test.provenance.samplingInterval ?? "Sampling interval not recorded",
            fillModel: experiment.test.provenance.fillModel ?? "Execution model not recorded",
          },
        }));
      }
      if (experiment.test.result) {
        setSuccessfulConfiguration({
          strategy: experiment.test.strategy, startDate: experiment.test.startDate, endDate: experiment.test.endDate,
          stockCodes: experiment.test.symbols, initialCash: experiment.test.initialCash,
          feeRate: configuration?.feeRate ?? 0.0001, minimumFee: configuration?.minimumFee ?? 1,
          slippagePerShare: configuration?.slippagePerShare ?? 0.01,
        });
      }
      } else if (transferred.length) setStockCodes(transferred.join(","));
      else if (experiment.symbol) setStockCodes(experiment.symbol);
    };
    void restore();
    return () => { active = false; };
  }, [experiment.falsification, experiment.hypothesis, experiment.symbol, experiment.test, hydrated, searchParams, setFalsification, setHypothesis]);

  const currentConfiguration: SubmittedConfiguration = {
    strategy, startDate, endDate, stockCodes: normalizeStockCodes(stockCodes), initialCash,
    feeRate, minimumFee, slippagePerShare,
  };
  const configurationChanged = Boolean(result && successfulConfiguration && !configurationsMatch(currentConfiguration, successfulConfiguration));

  const runEvidenceField = async () => {
    if (!currentConfiguration.stockCodes.length) { setError("Enter at least one stock code."); return; }
    if (currentConfiguration.stockCodes.length > 20) { setError("Use no more than 20 stock codes in one evidence field."); return; }
    const invalidStockCode = currentConfiguration.stockCodes.find((code) => !/^[A-Z0-9.-]{1,16}$/.test(code));
    if (invalidStockCode) { setError(`Invalid stock code: ${invalidStockCode}. Use 1–16 letters, numbers, dots, or hyphens.`); return; }
    if (!startDate || !endDate || startDate >= endDate) { setError("End date must be after the start date."); return; }
    if (![initialCash, feeRate, minimumFee, slippagePerShare].every(Number.isFinite) || initialCash <= 0 || feeRate < 0 || minimumFee < 0 || slippagePerShare < 0) {
      setError("Cash must be positive and execution assumptions cannot be negative."); return;
    }
    if (initialCash > 1_000_000_000_000 || feeRate > 1 || minimumFee > 1_000_000 || slippagePerShare > 1_000_000) {
      setError("One or more execution assumptions exceed the supported research range."); return;
    }
    setLoading(true); setError(""); setRunningStage("Computing baseline");
    const request: BacktestRequest = {
      strategy, start_date: startDate, end_date: endDate, stock_codes: currentConfiguration.stockCodes,
      initial_cash: initialCash, fee_rate: feeRate, min_fee: minimumFee, slippage_per_share: slippagePerShare,
    };
    try {
      const baselineResult = await api.backtest(request);
      if (!isBacktestResult(baselineResult)) throw new Error("The backtest service returned an invalid result.");
      setResult(baselineResult); setSuccessfulConfiguration(currentConfiguration);
      const definitions = buildPerturbations(currentConfiguration);
      setRunningStage("Challenging four nearby assumptions");
      const settled = await Promise.allSettled(definitions.map((definition) => api.backtest(definition.request)));
      const observations: EvidenceObservation[] = definitions.map((definition, index) => {
        const outcome = settled[index];
        return {
          id: definition.id, label: definition.label, parameter: definition.parameter,
          baselineValue: definition.baselineValue, perturbedValue: definition.perturbedValue,
          status: outcome.status === "fulfilled" && isBacktestResult(outcome.value) ? "succeeded" : "failed",
          result: outcome.status === "fulfilled" && isBacktestResult(outcome.value) ? snapshotBacktest(outcome.value) : null,
        };
      });
      const provenance = GUEST_MODE ? GUEST_BACKTEST_PROVENANCE : SERVICE_BACKTEST_PROVENANCE;
      const claim = experiment.hypothesis.trim() || `${strategy.replaceAll("_", " ")} remains directionally stable under nearby execution and sampling assumptions.`;
      const falsifiedIf = experiment.falsification.trim() || "The return direction reverses when one plausible assumption changes while the others remain fixed.";
      if (!experiment.hypothesis.trim()) setHypothesis(claim);
      if (!experiment.falsification.trim()) setFalsification(falsifiedIf);
      const artifact = createEvidenceArtifact({
        claim, falsifiedIf, configuration: currentConfiguration,
        baseline: snapshotBacktest(baselineResult), observations,
        provenance: {
          resultOrigin: provenance.resultOrigin,
          dataMode: "controlled-synthetic",
          dataSource: provenance.dataSource ?? "EPSILON controlled synthetic path",
          samplingInterval: provenance.samplingInterval ?? "Synthetic daily observations",
          fillModel: provenance.fillModel ?? "Controlled synthetic execution model",
        },
      });
      setEvidenceArtifact(artifact);
      recordBacktest({
        method: "backtest", strategy, symbols: currentConfiguration.stockCodes, startDate, endDate, initialCash,
        totalReturn: baselineResult.performance.total_return, sharpe: baselineResult.performance.sharpe,
        maxDrawdown: baselineResult.performance.max_drawdown, tradeCount: baselineResult.trades.length,
        completedAt: artifact.generatedAt, result: baselineResult, perturbationEvidence: artifact,
        provenance: { ...provenance, feeRate, minimumFee, slippagePerShare },
      });
    } catch (caught) {
      setError(`Latest attempt failed: ${caught instanceof Error ? caught.message : "The evidence run failed."}`);
    } finally { setLoading(false); setRunningStage(""); }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(18rem,0.34fr)_minmax(0,1fr)]">
        <section className="lab-panel min-w-0 p-5 lg:p-6" aria-label="Experiment setup">
          <p className="lab-section-kicker">01 / Define</p>
          <h2 className="mt-2 text-lg font-semibold text-base-content">One claim. One rejection rule.</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/48">EPSILON will hold this baseline constant, then change one assumption at a time.</p>
          <div className="mt-6 space-y-4">
            <div><label htmlFor="strategy-hypothesis" className="lab-field-label">Falsifiable claim</label><textarea id="strategy-hypothesis" value={experiment.hypothesis} onChange={(event) => setHypothesis(event.target.value)} rows={3} maxLength={500} placeholder="Momentum remains positive after plausible execution costs." className="lab-input resize-y" /></div>
            <div><label htmlFor="strategy-falsification" className="lab-field-label text-warning/80">Reject or revise if</label><textarea id="strategy-falsification" value={experiment.falsification} onChange={(event) => setFalsification(event.target.value)} rows={3} maxLength={500} placeholder="The return direction reverses under higher cost or a shifted window." className="lab-input resize-y focus:border-warning/60" /></div>
            {testState === "stale" && <p className="text-xs leading-5 text-warning">Needs retest — the saved evidence belongs to an earlier claim.</p>}
            <div className="border-t instrument-rule pt-4"><p className="instrument-label">Baseline configuration</p></div>
            <div><label htmlFor="backtest-strategy" className="lab-field-label">Strategy</label><select id="backtest-strategy" value={strategy} onChange={(event) => setStrategy(event.target.value)} className="lab-input"><option value="buy_and_hold">Buy & Hold</option><option value="moving_average">Moving Average (20-day)</option><option value="momentum">Momentum (2%)</option></select></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><div><label htmlFor="backtest-start-date" className="lab-field-label">Start</label><input id="backtest-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="lab-input" /></div><div><label htmlFor="backtest-end-date" className="lab-field-label">End</label><input id="backtest-end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="lab-input" /></div></div>
            <div><label htmlFor="backtest-universe" className="lab-field-label">Universe</label><input id="backtest-universe" value={stockCodes} onChange={(event) => setStockCodes(event.target.value)} className="lab-input font-mono" /></div>
            <div><label htmlFor="backtest-initial-cash" className="lab-field-label">Initial cash</label><input id="backtest-initial-cash" type="number" min="1" value={initialCash} onChange={(event) => setInitialCash(Number(event.target.value))} className="lab-input font-mono" /></div>
            <div className="grid grid-cols-3 gap-2"><div><label htmlFor="fee-rate" className="lab-field-label">Fee rate</label><input id="fee-rate" type="number" min="0" step="0.0001" value={feeRate} onChange={(event) => setFeeRate(Number(event.target.value))} className="lab-input font-mono" /></div><div><label htmlFor="minimum-fee" className="lab-field-label">Min fee</label><input id="minimum-fee" type="number" min="0" step="0.5" value={minimumFee} onChange={(event) => setMinimumFee(Number(event.target.value))} className="lab-input font-mono" /></div><div><label htmlFor="slippage" className="lab-field-label">Slip/share</label><input id="slippage" type="number" min="0" step="0.01" value={slippagePerShare} onChange={(event) => setSlippagePerShare(Number(event.target.value))} className="lab-input font-mono" /></div></div>
            <button type="button" aria-label="Run Backtest" onClick={runEvidenceField} disabled={loading} className="instrument-button w-full disabled:cursor-not-allowed disabled:opacity-45">{loading ? runningStage || "Running evidence field" : "Run evidence field →"}</button>
            <p className="text-[11px] leading-5 text-base-content/38">Five controlled computations: one baseline plus four atomic perturbations. No real capital or historical performance claim.</p>
            {error && <div role="alert" className="border border-error/30 bg-error/8 p-3 text-sm text-error">{error}</div>}
          </div>
        </section>

        <section className="min-w-0" aria-label="Experiment evidence">
          {!evidenceArtifact ? (
            <div className="instrument-panel flex min-h-[620px] flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="instrument-label">02 / Perturb</p>
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-base-content">A single backtest is an answer. A field of nearby tests is evidence.</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-base-content/50">Run the baseline and EPSILON will expose how the result moves when cost, slippage, window, and universe change independently.</p>
                <div className="mt-10 h-[260px] border border-base-300 bg-[#0b0c10] p-5" aria-hidden="true">
                  <svg viewBox="0 0 880 250" className="h-full w-full" preserveAspectRatio="none"><path d="M0 180 C150 170 210 120 340 135 S520 85 650 100 S790 45 880 55" fill="none" stroke="#f0efea" strokeWidth="2" vectorEffect="non-scaling-stroke" /><line x1="0" x2="880" y1="180" y2="180" stroke="rgba(240,239,234,.18)" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" /></svg>
                </div>
              </div>
              <div className="grid gap-px border border-base-300 bg-base-300 sm:grid-cols-4">{["Fee rate", "Slippage", "Test window", "Universe"].map((label) => <div key={label} className="bg-base-100 p-3"><p className="instrument-label">ε / {label}</p><p className="mt-2 text-xs text-base-content/42">One input changes</p></div>)}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {configurationChanged && <div role="status" className="border border-warning/30 bg-warning/8 px-4 py-3 text-sm text-warning"><span className="font-medium">Previous successful run.</span> Displayed results belong to the previous successful run; retest the changed inputs to update them.</div>}
              <EvidencePlate artifact={evidenceArtifact} />
              {result && successfulConfiguration && (
                <section className="instrument-panel p-5 sm:p-6" aria-label="Baseline result detail">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="instrument-label">Baseline ledger</p><h3 className="mt-2 text-lg font-semibold">Submitted configuration</h3></div><button type="button" aria-label="Export result artifact (JSON)" onClick={() => downloadBacktestResult(result, successfulConfiguration)} className="instrument-button-secondary">Export JSON</button></div>
                  <p className="mt-3 font-mono text-xs text-base-content/45">{successfulConfiguration.stockCodes.join(", ")} · {successfulConfiguration.startDate} → {successfulConfiguration.endDate}</p>
                  <div className="mt-5 grid gap-px border border-base-300 bg-base-300 sm:grid-cols-2 lg:grid-cols-5">{[
                    ["Return", `${result.performance.total_return.toFixed(2)}%`], ["Sharpe", result.performance.sharpe.toFixed(3)], ["Drawdown", `${result.performance.max_drawdown.toFixed(2)}%`], ["Profit Factor", result.performance.profit_factor.toFixed(2)], ["Trades", String(result.trades.length)],
                  ].map(([label, value]) => <div key={label} className="bg-base-100/95 p-4"><p className="instrument-label">{label}</p><p className="mt-3 font-mono text-lg text-base-content">{value}</p></div>)}</div>
                  <details open className="mt-5 border-t instrument-rule pt-4"><summary className="cursor-pointer text-sm font-medium text-base-content/70">Trade Results ({result.trades.length} trades)</summary><div className="mt-4 max-h-80 overflow-auto"><table className="w-full min-w-[620px] text-xs"><thead className="font-mono uppercase tracking-[0.1em] text-base-content/38"><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Symbol</th><th className="p-2 text-left">Type</th><th className="p-2 text-right">Shares</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Total</th></tr></thead><tbody>{result.trades.map((trade, index) => <tr key={`${trade.date}-${trade.stock_code}-${index}`} className="border-t instrument-rule"><td className="p-2 text-base-content/55">{trade.date}</td><td className="p-2"><span>{trade.stock_code}</span>{trade.stock_name && <span className="ml-2 text-base-content/38">{trade.stock_name}</span>}</td><td className="p-2">{trade.trade_type}</td><td className="p-2 text-right font-mono">{trade.shares}</td><td className="p-2 text-right font-mono">${trade.price.toFixed(2)}</td><td className="p-2 text-right font-mono">${trade.total_amount.toFixed(2)}</td></tr>)}</tbody></table></div></details>
                </section>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
