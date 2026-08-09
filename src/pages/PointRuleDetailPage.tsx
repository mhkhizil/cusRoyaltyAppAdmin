import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ApiLoadingState } from "@/components/ApiLoadingState";
import { Button } from "@/components/ui/Button";
import {
  type PointRule,
  type PointRuleLifecycleStatus,
} from "@/core/domain/entities/PointRule";
import { useBranchManagement } from "@/core/presentation/hooks/useBranchManagement";
import { usePointsManagement } from "@/core/presentation/hooks/usePointsManagement";

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

export function PointRuleDetailPage() {
  const { ruleId = "" } = useParams<{ ruleId: string }>();
  const { t } = useTranslation();
  const { loadRuleById, scanLocations, loadScanLocations, error, clearError } =
    usePointsManagement();
  const { branches, loadBranches } = useBranchManagement();

  const [rule, setRule] = useState<PointRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const branchLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const branch of [...branches, ...scanLocations]) {
      if (!map.has(branch.id)) {
        map.set(branch.id, branch.displayLabel);
      }
    }
    return map;
  }, [branches, scanLocations]);

  const formatRuleScope = useCallback(
    (item: PointRule) => {
      if (item.appliesToAllBranches()) {
        return t("points.rules.scope.allBranches");
      }
      return item.formatLocationScope(
        (branchId) => branchLabelById.get(branchId) || branchId
      );
    },
    [branchLabelById, t]
  );

  useEffect(() => {
    void loadScanLocations().catch(() => undefined);
    void loadBranches().catch(() => undefined);
  }, [loadBranches, loadScanLocations]);

  useEffect(() => {
    if (!ruleId) {
      setLoadError(t("points.rules.details.notFound"));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    clearError();

    void loadRuleById(ruleId)
      .then(setRule)
      .catch((err) => {
        setRule(null);
        setLoadError(
          err instanceof Error ? err.message : t("points.rules.details.loadError")
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clearError, loadRuleById, ruleId, t]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl">
        <ApiLoadingState label={t("points.rules.details.loading")} />
      </section>
    );
  }

  if (!rule) {
    return (
      <section className="mx-auto max-w-4xl space-y-4">
        <Link to="/points">
          <Button variant="secondary">{t("points.rules.details.backToPoints")}</Button>
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError || error || t("points.rules.details.notFound")}
        </div>
      </section>
    );
  }

  const lifecycleStatus = rule.resolveLifecycleStatus();

  return (
    <section className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Link
            to="/points"
            className="text-sm font-medium text-shop-primary hover:underline"
          >
            {t("points.rules.details.backToPoints")}
          </Link>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {rule.name || t("points.rules.details.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("points.rules.details.subtitle")}
          </p>
        </div>
        <Link to="/points">
          <Button variant="secondary" className="w-full sm:w-auto">
            {t("points.rules.details.backToPoints")}
          </Button>
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <span className={getRuleStatusClassName(lifecycleStatus)}>
            {t(`points.rules.status.${lifecycleStatus.toLowerCase()}`)}
          </span>
          {rule.normalizedStatus() ? (
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
              ({rule.normalizedStatus()})
            </span>
          ) : null}
        </div>

        <dl className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.columns.type")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {rule.normalizedCalculationType() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.columns.points")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {rule.formatPointsSummary()}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.fields.priority")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {rule.priority ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.fields.minimumPurchase")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {rule.minimumPurchase ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.fields.maximumPointsPerScan")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {rule.maximumPointsPerScan ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.fields.dailyUserPointCap")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {rule.dailyUserPointCap ?? "—"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.fields.description")}
            </dt>
            <dd className="mt-1 text-slate-900 dark:text-white">
              {rule.description || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.columns.branches")}
            </dt>
            <dd className="mt-1 text-slate-900 dark:text-white">
              {formatRuleScope(rule)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.fields.startsAt")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {formatDate(rule.startsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.fields.endsAt")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {formatDate(rule.endsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.details.createdAt")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {formatDate(rule.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("points.rules.details.updatedAt")}
            </dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-white">
              {formatDate(rule.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
