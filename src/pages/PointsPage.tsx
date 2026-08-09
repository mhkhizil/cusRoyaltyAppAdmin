import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiLoadingState } from "@/components/ApiLoadingState";
import { Button } from "@/components/ui/Button";
import { QrScanner } from "@/components/QrScanner";
import { usePointsManagement } from "@/core/presentation/hooks/usePointsManagement";
import { useBranchManagement } from "@/core/presentation/hooks/useBranchManagement";
import {
  isPointCalculationType,
  type PointCalculationType,
  type PointRule,
  type PointRuleLifecycleStatus,
} from "@/core/domain/entities/PointRule";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-shop-ring dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getRuleStatusClassName(status: PointRuleLifecycleStatus): string {
  switch (status) {
    case "ACTIVE":
      return "font-medium text-emerald-700 dark:text-emerald-300";
    case "SCHEDULED":
      return "font-medium text-amber-700 dark:text-amber-300";
    case "EXPIRED":
      return "font-medium text-slate-500 dark:text-slate-400";
    default:
      return "font-medium text-red-700 dark:text-red-300";
  }
}

export function PointsPage() {
  const { t } = useTranslation();
  const {
    rules,
    scanLocations,
    lastScanResult,
    isLoading,
    isScanLocationsLoading,
    error,
    loadRules,
    loadScanLocations,
    createRule,
    scanQr,
    clearError,
    clearScanResult,
  } = usePointsManagement();
  const {
    branches,
    isLoading: isBranchesLoading,
    loadBranches,
  } = useBranchManagement();

  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [locationId, setLocationId] = useState("");
  const [purchaseId, setPurchaseId] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const scanFormRef = useRef({
    purchaseAmount: "",
    locationId: "",
    purchaseId: "",
  });

  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [calculationType, setCalculationType] =
    useState<PointCalculationType>("AMOUNT_BASED");
  const [flatPoints, setFlatPoints] = useState("");
  const [spendUnit, setSpendUnit] = useState("");
  const [pointsPerSpendUnit, setPointsPerSpendUnit] = useState("");
  const [minimumPurchase, setMinimumPurchase] = useState("");
  const [maximumPointsPerScan, setMaximumPointsPerScan] = useState("");
  const [dailyUserPointCap, setDailyUserPointCap] = useState("");
  const [priority, setPriority] = useState("0");
  const [selectedRuleLocationIds, setSelectedRuleLocationIds] = useState<
    string[]
  >([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [ruleError, setRuleError] = useState<string | null>(null);

  useEffect(() => {
    scanFormRef.current = {
      purchaseAmount,
      locationId,
      purchaseId,
    };
  }, [purchaseAmount, locationId, purchaseId]);

  const refresh = () => {
    clearError();
    void loadRules().catch(() => undefined);
    void loadScanLocations().catch(() => undefined);
    void loadBranches().catch(() => undefined);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!locationId && scanLocations.length > 0) {
      setLocationId(scanLocations[0].id);
    }
  }, [locationId, scanLocations]);

  const branchLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const branch of [...branches, ...scanLocations]) {
      if (!map.has(branch.id)) {
        map.set(branch.id, branch.displayLabel);
      }
    }
    return map;
  }, [branches, scanLocations]);

  const resolveBranchLabel = useCallback(
    (branchId: string) => branchLabelById.get(branchId) || branchId,
    [branchLabelById]
  );

  const formatRuleScope = useCallback(
    (rule: PointRule) => {
      if (rule.appliesToAllBranches()) {
        return t("points.rules.scope.allBranches");
      }
      return rule.formatLocationScope(resolveBranchLabel);
    },
    [resolveBranchLabel, t]
  );

  const toggleRuleLocation = (branchId: string) => {
    setSelectedRuleLocationIds((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    );
  };

  const handleQrDetected = useCallback(
    async (decodedToken: string) => {
      if (isProcessingScan) return;

      const form = scanFormRef.current;
      const amount = Number(form.purchaseAmount);

      setScanError(null);
      clearScanResult();

      if (form.purchaseAmount.trim() === "" || Number.isNaN(amount) || amount < 0) {
        setScanError(t("points.scan.invalidAmount"));
        return;
      }

      const branchId = form.locationId.trim();
      if (!branchId) {
        setScanError(t("points.scan.invalidLocation"));
        return;
      }

      setIsProcessingScan(true);
      try {
        await scanQr({
          idempotencyKey: createIdempotencyKey(),
          qrToken: decodedToken,
          purchaseAmount: amount,
          locationId: branchId,
          purchaseId: form.purchaseId.trim() || undefined,
        });
        setPurchaseAmount("");
        setPurchaseId("");
      } catch (err) {
        setScanError(
          err instanceof Error ? err.message : t("points.scan.error")
        );
      } finally {
        setIsProcessingScan(false);
      }
    },
    [clearScanResult, isProcessingScan, scanQr, t]
  );

  const handleCreateRule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRuleError(null);

    try {
      await createRule({
        name: ruleName.trim(),
        description: ruleDescription.trim() || undefined,
        calculationType,
        flatPoints:
          (calculationType === "FLAT" || calculationType === "HYBRID") &&
          flatPoints !== ""
            ? Number(flatPoints)
            : undefined,
        spendUnit:
          (calculationType === "AMOUNT_BASED" || calculationType === "HYBRID") &&
          spendUnit !== ""
            ? Number(spendUnit)
            : undefined,
        pointsPerSpendUnit:
          (calculationType === "AMOUNT_BASED" || calculationType === "HYBRID") &&
          pointsPerSpendUnit !== ""
            ? Number(pointsPerSpendUnit)
            : undefined,
        minimumPurchase:
          minimumPurchase !== "" ? Number(minimumPurchase) : undefined,
        maximumPointsPerScan:
          maximumPointsPerScan !== ""
            ? Number(maximumPointsPerScan)
            : undefined,
        dailyUserPointCap:
          dailyUserPointCap !== "" ? Number(dailyUserPointCap) : undefined,
        priority: priority !== "" ? Number(priority) : undefined,
        locationIds:
          selectedRuleLocationIds.length > 0
            ? selectedRuleLocationIds
            : undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      });

      setRuleName("");
      setRuleDescription("");
      setCalculationType("AMOUNT_BASED");
      setFlatPoints("");
      setSpendUnit("");
      setPointsPerSpendUnit("");
      setMinimumPurchase("");
      setMaximumPointsPerScan("");
      setDailyUserPointCap("");
      setPriority("0");
      setSelectedRuleLocationIds([]);
      setStartsAt("");
      setEndsAt("");
    } catch (err) {
      setRuleError(
        err instanceof Error ? err.message : t("points.rules.createError")
      );
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {t("points.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("points.description")}
          </p>
        </div>
        <Button
          variant="secondary"
          isLoading={isLoading}
          className="w-full sm:w-auto"
          onClick={refresh}
        >
          {isLoading ? t("common.refreshing") : t("common.refresh")}
        </Button>
      </header>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/40">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t("points.guidance.title")}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>{t("points.guidance.rulesDrivePoints")}</li>
          <li>{t("points.guidance.payableAmount")}</li>
          <li>{t("points.guidance.customerQr")}</li>
          <li>{t("points.guidance.noRuleZeroPoints")}</li>
        </ul>
      </div>

      {(error || scanError || ruleError) && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {scanError || ruleError || error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("points.scan.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("points.scan.subtitle")}
          </p>

          <div className="mt-4 space-y-3">
            <input
              className={inputClassName}
              type="number"
              min="0"
              step="0.01"
              placeholder={t("points.scan.fields.purchaseAmount")}
              value={purchaseAmount}
              onChange={(event) => setPurchaseAmount(event.target.value)}
              required
            />
            <select
              className={inputClassName}
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              aria-label={t("points.scan.fields.locationId")}
              required
            >
              <option value="" disabled>
                {t("points.scan.fields.locationPlaceholder")}
              </option>
              {scanLocations.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.displayLabel}
                </option>
              ))}
            </select>
            {isScanLocationsLoading && scanLocations.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("points.scanLocations.loading")}
              </p>
            ) : null}
            {!isScanLocationsLoading && scanLocations.length === 0 ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t("points.scanLocations.empty")}
              </p>
            ) : null}
            <input
              className={inputClassName}
              placeholder={t("points.scan.fields.purchaseId")}
              value={purchaseId}
              onChange={(event) => setPurchaseId(event.target.value)}
            />

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("points.scan.cameraHint")}
            </p>

            <QrScanner
              onScan={(token) => {
                void handleQrDetected(token);
              }}
              paused={
                isProcessingScan ||
                isLoading ||
                scanLocations.length === 0 ||
                !locationId
              }
            />

            {isProcessingScan ? (
              <p className="text-sm font-medium text-shop-primary">
                {t("points.scan.processing")}
              </p>
            ) : null}
          </div>

          {lastScanResult ? (
            <div
              className={`mt-4 rounded-lg border p-4 text-sm ${
                lastScanResult.hasNoMatchingRule()
                  ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
              }`}
            >
              <p className="font-semibold">
                {lastScanResult.hasNoMatchingRule()
                  ? t("points.scan.resultTitleZeroPoints")
                  : t("points.scan.resultTitle")}
              </p>

              {lastScanResult.hasNoMatchingRule() ? (
                <p className="mt-2 rounded-md border border-amber-300/60 bg-white/60 px-3 py-2 text-sm dark:border-amber-800/60 dark:bg-black/20">
                  {t("points.scan.result.noMatchingRule")}
                </p>
              ) : null}

              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.purchaseAmount")}
                  </dt>
                  <dd className="font-medium">{lastScanResult.purchaseAmount}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.discountAmount")}
                  </dt>
                  <dd className="font-medium">{lastScanResult.discountAmount}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.payableAmount")}
                  </dt>
                  <dd className="font-medium">{lastScanResult.payableAmount}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.pointsAwarded")}
                  </dt>
                  <dd className="font-medium">{lastScanResult.pointsAwarded}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.campaign")}
                  </dt>
                  <dd className="font-medium">
                    {lastScanResult.formatCampaignLabel() ||
                      t("points.scan.result.noCampaign")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.ruleId")}
                  </dt>
                  <dd className="truncate font-medium">
                    {lastScanResult.ruleId || t("points.scan.result.noRuleApplied")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.customerId")}
                  </dt>
                  <dd className="truncate font-medium">
                    {lastScanResult.customerId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.tierName")}
                  </dt>
                  <dd className="font-medium">
                    {lastScanResult.tierName || "—"}
                    {lastScanResult.tierUpgraded
                      ? ` (${t("points.scan.result.tierUpgraded")})`
                      : ""}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide opacity-70">
                    {t("points.scan.result.scanId")}
                  </dt>
                  <dd className="truncate font-medium">{lastScanResult.scanId}</dd>
                </div>
                {lastScanResult.purchaseId ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide opacity-70">
                      {t("points.scan.result.purchaseId")}
                    </dt>
                    <dd className="truncate font-medium">
                      {lastScanResult.purchaseId}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {lastScanResult.badgesAwarded.length > 0 ? (
                <p className="mt-3">
                  {t("points.scan.result.badges")}:{" "}
                  {lastScanResult.badgesAwarded.join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("points.rules.createTitle")}
          </h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleCreateRule}>
            <input
              className={`${inputClassName} sm:col-span-2`}
              placeholder={t("points.rules.fields.name")}
              value={ruleName}
              onChange={(event) => setRuleName(event.target.value)}
              required
            />
            <input
              className={`${inputClassName} sm:col-span-2`}
              placeholder={t("points.rules.fields.description")}
              value={ruleDescription}
              onChange={(event) => setRuleDescription(event.target.value)}
            />
            <select
              className={`${inputClassName} sm:col-span-2`}
              value={calculationType}
              onChange={(event) => {
                const nextType = event.target.value.toUpperCase();
                if (isPointCalculationType(nextType)) {
                  setCalculationType(nextType);
                }
              }}
            >
              <option value="FLAT">{t("points.rules.calculation.flat")}</option>
              <option value="AMOUNT_BASED">
                {t("points.rules.calculation.amountBased")}
              </option>
              <option value="HYBRID">{t("points.rules.calculation.hybrid")}</option>
            </select>

            {calculationType === "FLAT" ? (
              <input
                className={`${inputClassName} sm:col-span-2`}
                type="number"
                min="0"
                placeholder={t("points.rules.fields.flatPoints")}
                value={flatPoints}
                onChange={(event) => setFlatPoints(event.target.value)}
                required
              />
            ) : calculationType === "AMOUNT_BASED" ? (
              <>
                <input
                  className={inputClassName}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t("points.rules.fields.spendUnit")}
                  value={spendUnit}
                  onChange={(event) => setSpendUnit(event.target.value)}
                  required
                />
                <input
                  className={inputClassName}
                  type="number"
                  min="0"
                  placeholder={t("points.rules.fields.pointsPerSpendUnit")}
                  value={pointsPerSpendUnit}
                  onChange={(event) => setPointsPerSpendUnit(event.target.value)}
                  required
                />
              </>
            ) : (
              <>
                <input
                  className={`${inputClassName} sm:col-span-2`}
                  type="number"
                  min="0"
                  placeholder={t("points.rules.fields.flatPoints")}
                  value={flatPoints}
                  onChange={(event) => setFlatPoints(event.target.value)}
                  required
                />
                <input
                  className={inputClassName}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={t("points.rules.fields.spendUnit")}
                  value={spendUnit}
                  onChange={(event) => setSpendUnit(event.target.value)}
                  required
                />
                <input
                  className={inputClassName}
                  type="number"
                  min="0"
                  placeholder={t("points.rules.fields.pointsPerSpendUnit")}
                  value={pointsPerSpendUnit}
                  onChange={(event) => setPointsPerSpendUnit(event.target.value)}
                  required
                />
              </>
            )}

            <input
              className={inputClassName}
              type="number"
              min="0"
              step="0.01"
              placeholder={t("points.rules.fields.minimumPurchase")}
              value={minimumPurchase}
              onChange={(event) => setMinimumPurchase(event.target.value)}
            />
            <input
              className={inputClassName}
              type="number"
              min="0"
              placeholder={t("points.rules.fields.maximumPointsPerScan")}
              value={maximumPointsPerScan}
              onChange={(event) => setMaximumPointsPerScan(event.target.value)}
            />
            <input
              className={inputClassName}
              type="number"
              min="0"
              placeholder={t("points.rules.fields.dailyUserPointCap")}
              value={dailyUserPointCap}
              onChange={(event) => setDailyUserPointCap(event.target.value)}
            />
            <input
              className={inputClassName}
              type="number"
              placeholder={t("points.rules.fields.priority")}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            />
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("points.rules.fields.locationIds")}
              </legend>
              {branches.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isBranchesLoading
                    ? t("points.branches.loading")
                    : t("points.branches.empty")}
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {branches.map((branch) => (
                    <label
                      key={branch.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRuleLocationIds.includes(branch.id)}
                        onChange={() => toggleRuleLocation(branch.id)}
                      />
                      <span className="truncate">{branch.displayLabel}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
            <input
              className={inputClassName}
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              aria-label={t("points.rules.fields.startsAt")}
            />
            <input
              className={inputClassName}
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              aria-label={t("points.rules.fields.endsAt")}
            />
            <div className="sm:col-span-2">
              <Button type="submit" isLoading={isLoading}>
                {t("points.rules.createSubmit")}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {isLoading && rules.length === 0 ? (
        <ApiLoadingState label={t("points.rules.loading")} />
      ) : rules.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("points.rules.empty")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {t("points.rules.listTitle", { count: rules.length })}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("points.rules.listHint")}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[72rem] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.name")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.status")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.type")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.points")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.priority")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.minimum")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.maxPerScan")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.dailyCap")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.branches")}
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">
                    {t("points.rules.columns.window")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rules.map((rule) => {
                  const lifecycleStatus = rule.resolveLifecycleStatus();

                  return (
                    <tr
                      key={rule.id}
                      className="text-slate-700 dark:text-slate-200"
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-medium sm:px-4">
                        {rule.name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        <span className={getRuleStatusClassName(lifecycleStatus)}>
                          {t(`points.rules.status.${lifecycleStatus.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        {rule.normalizedCalculationType() || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        {rule.formatPointsSummary()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        {rule.priority ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        {rule.minimumPurchase ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        {rule.maximumPointsPerScan ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                        {rule.dailyUserPointCap ?? "—"}
                      </td>
                      <td className="max-w-[14rem] px-3 py-3 sm:px-4">
                        <span className="line-clamp-2" title={formatRuleScope(rule)}>
                          {formatRuleScope(rule)}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="min-w-[11rem]">
                          <div>{formatDate(rule.startsAt)}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(rule.endsAt)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
