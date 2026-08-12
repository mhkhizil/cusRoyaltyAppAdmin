import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ApiLoadingState } from "@/components/ApiLoadingState";
import { Button } from "@/components/ui/Button";
import { ImageFilePicker } from "@/components/ui/ImageFilePicker";
import {
  REWARD_REDEMPTION_STATUSES,
  REWARD_STATUSES,
  REWARD_TYPES,
  isBonusPointsRewardType,
  isRewardRedemptionStatus,
  isRewardStatus,
  isRewardType,
  type RewardStatus,
} from "@/core/domain/entities/Reward";
import { useRewardManagement } from "@/core/presentation/hooks/useRewardManagement";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-shop-ring dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStatusClassName(status: string): string {
  switch (status.trim().toUpperCase()) {
    case "ACTIVE":
      return "font-medium text-emerald-700 dark:text-emerald-300";
    case "DRAFT":
      return "font-medium text-amber-700 dark:text-amber-300";
    case "PAUSED":
      return "font-medium text-slate-600 dark:text-slate-300";
    case "ARCHIVED":
      return "font-medium text-slate-500 dark:text-slate-400";
    default:
      return "font-medium text-slate-700 dark:text-slate-200";
  }
}

function getRedemptionStatusClassName(status: string): string {
  switch (status.trim().toUpperCase()) {
    case "PENDING":
      return "font-medium text-amber-700 dark:text-amber-300";
    case "COMPLETED":
      return "font-medium text-emerald-700 dark:text-emerald-300";
    case "CANCELLED":
    case "EXPIRED":
      return "font-medium text-slate-500 dark:text-slate-400";
    default:
      return "font-medium text-slate-700 dark:text-slate-200";
  }
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseRequiredNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function RewardsPage() {
  const { t } = useTranslation();
  const {
    rewards,
    redemptions,
    lastCreateResult,
    isLoading,
    error,
    loadRewards,
    createReward,
    updateRewardStatus,
    loadRedemptions,
    fulfillRedemption,
    clearError,
    clearCreateResult,
  } = useRewardManagement();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [type, setType] = useState<(typeof REWARD_TYPES)[number]>("BONUS_POINTS");
  const [pointsCost, setPointsCost] = useState("");
  const [bonusPoints, setBonusPoints] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [freeProductId, setFreeProductId] = useState("");
  const [minimumTierId, setMinimumTierId] = useState("");
  const [unlockThreshold, setUnlockThreshold] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [redemptionRewardFilter, setRedemptionRewardFilter] = useState("");
  const [redemptionStatusFilter, setRedemptionStatusFilter] = useState<
    "" | (typeof REWARD_REDEMPTION_STATUSES)[number]
  >("PENDING");
  const [fulfillError, setFulfillError] = useState<string | null>(null);

  useEffect(() => {
    void loadRewards().catch(() => undefined);
  }, [loadRewards]);

  useEffect(() => {
    void loadRedemptions({
      rewardId: redemptionRewardFilter || undefined,
      status: redemptionStatusFilter || undefined,
    }).catch(() => undefined);
  }, [loadRedemptions, redemptionRewardFilter, redemptionStatusFilter]);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    clearError();
    clearCreateResult();

    const isBonusPoints = isBonusPointsRewardType(type);
    const parsedBonusPoints = parseOptionalNumber(bonusPoints);
    const parsedPointsCost = parseRequiredNumber(pointsCost);

    if (isBonusPoints) {
      if (parsedBonusPoints === undefined || parsedBonusPoints <= 0) {
        setFormError(t("rewards.validation.bonusPointsRequired"));
        return;
      }
    } else if (parsedPointsCost === undefined) {
      setFormError(t("rewards.validation.pointsCostRequired"));
      return;
    }

    try {
      await createReward({
        name,
        slug,
        description: description.trim() || undefined,
        type,
        ...(isBonusPoints
          ? { bonusPoints: parsedBonusPoints }
          : { pointsCost: parsedPointsCost }),
        discountValue: parseOptionalNumber(discountValue),
        freeProductId: freeProductId.trim() || undefined,
        minimumTierId: minimumTierId.trim() || undefined,
        unlockMetric: "NONE",
        unlockThreshold: parseOptionalNumber(unlockThreshold),
        stockQuantity: parseOptionalNumber(stockQuantity),
        perUserLimit: parseOptionalNumber(perUserLimit),
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
        file: imageFile ?? undefined,
      });

      setName("");
      setSlug("");
      setSlugTouched(false);
      setDescription("");
      setImageFile(null);
      setType("BONUS_POINTS");
      setPointsCost("");
      setBonusPoints("");
      setDiscountValue("");
      setFreeProductId("");
      setMinimumTierId("");
      setUnlockThreshold("");
      setStockQuantity("");
      setPerUserLimit("");
      setStartsAt("");
      setEndsAt("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("rewards.createError")
      );
    }
  };

  const handleStatusChange = async (rewardId: string, status: string) => {
    clearError();
    try {
      await updateRewardStatus(rewardId, { status });
    } catch {
      // error surfaced via hook
    }
  };

  const handleFulfill = async (redemptionId: string) => {
    setFulfillError(null);
    clearError();
    try {
      await fulfillRedemption(redemptionId);
    } catch (err) {
      setFulfillError(
        err instanceof Error ? err.message : t("rewards.redemptions.fulfillError")
      );
    }
  };

  const refreshRedemptions = () => {
    void loadRedemptions({
      rewardId: redemptionRewardFilter || undefined,
      status: redemptionStatusFilter || undefined,
    }).catch(() => undefined);
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("rewards.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("rewards.description")}
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("rewards.createTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("rewards.createSubtitle")}
        </p>

        <form
          onSubmit={(event) => void handleCreate(event)}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <input
            className={inputClassName}
            placeholder={t("rewards.fields.name")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className={inputClassName}
            placeholder={t("rewards.fields.slug")}
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            required
          />
          <textarea
            className={`${inputClassName} sm:col-span-2`}
            placeholder={t("rewards.fields.description")}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
          />
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("rewards.fields.image")}
            </p>
            <ImageFilePicker
              value={imageFile}
              onChange={setImageFile}
              disabled={isLoading}
              chooseLabel={t("rewards.fields.chooseImage")}
              clearSelectionLabel={t("rewards.fields.clearSelection")}
              hint={t("rewards.fields.imageHint")}
              previewAlt={t("rewards.fields.imagePreviewAlt")}
            />
          </div>
          <select
            className={inputClassName}
            value={type}
            onChange={(event) => {
              const next = event.target.value;
              if (!isRewardType(next)) return;
              setType(next);
              if (isBonusPointsRewardType(next)) {
                setPointsCost("");
              }
            }}
            aria-label={t("rewards.fields.type")}
          >
            {REWARD_TYPES.map((rewardType) => (
              <option key={rewardType} value={rewardType}>
                {t(`rewards.types.${rewardType}`)}
              </option>
            ))}
          </select>
          {isBonusPointsRewardType(type) ? (
            <div className="space-y-2 sm:col-span-2">
              <input
                className={inputClassName}
                type="number"
                min={1}
                step="1"
                placeholder={t("rewards.fields.bonusPoints")}
                value={bonusPoints}
                onChange={(event) => setBonusPoints(event.target.value)}
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("rewards.fields.bonusPointsHint")}
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:col-span-2">
              <input
                className={inputClassName}
                type="number"
                min={0}
                step="any"
                placeholder={t("rewards.fields.pointsCost")}
                value={pointsCost}
                onChange={(event) => setPointsCost(event.target.value)}
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("rewards.fields.pointsCostHint")}
              </p>
            </div>
          )}
          {type === "BONUS_POINTS" ? null : type === "DISCOUNT" ? (
            <input
              className={inputClassName}
              type="number"
              min={0}
              step="any"
              placeholder={t("rewards.fields.discountValue")}
              value={discountValue}
              onChange={(event) => setDiscountValue(event.target.value)}
            />
          ) : null}
          {type === "FREE_PRODUCT" ? (
            <input
              className={inputClassName}
              placeholder={t("rewards.fields.freeProductId")}
              value={freeProductId}
              onChange={(event) => setFreeProductId(event.target.value)}
            />
          ) : null}
          <input
            className={inputClassName}
            placeholder={t("rewards.fields.minimumTierId")}
            value={minimumTierId}
            onChange={(event) => setMinimumTierId(event.target.value)}
          />
          <input
            className={inputClassName}
            type="number"
            min={0}
            step="any"
            placeholder={t("rewards.fields.unlockThreshold")}
            value={unlockThreshold}
            onChange={(event) => setUnlockThreshold(event.target.value)}
          />
          <input
            className={inputClassName}
            type="number"
            min={0}
            step="1"
            placeholder={t("rewards.fields.stockQuantity")}
            value={stockQuantity}
            onChange={(event) => setStockQuantity(event.target.value)}
          />
          <input
            className={inputClassName}
            type="number"
            min={0}
            step="1"
            placeholder={t("rewards.fields.perUserLimit")}
            value={perUserLimit}
            onChange={(event) => setPerUserLimit(event.target.value)}
          />
          <input
            className={inputClassName}
            type="datetime-local"
            aria-label={t("rewards.fields.startsAt")}
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
          <input
            className={inputClassName}
            type="datetime-local"
            aria-label={t("rewards.fields.endsAt")}
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={isLoading}>
              {t("rewards.createSubmit")}
            </Button>
          </div>

          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400 sm:col-span-2">
              {formError}
            </p>
          ) : null}
        </form>

        {lastCreateResult ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            {t("rewards.createSuccess", {
              id: lastCreateResult.id,
              pointsAwarded: lastCreateResult.pointsAwarded,
              recipients: lastCreateResult.recipients,
            })}
          </div>
        ) : null}
      </div>

      {isLoading && rewards.length === 0 ? (
        <ApiLoadingState label={t("rewards.loading")} />
      ) : rewards.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("rewards.empty")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t("rewards.total", { count: rewards.length })}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[56rem] w-full text-left text-sm md:min-w-full">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.columns.name")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.columns.slug")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.columns.type")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.columns.pointsCost")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.columns.status")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.columns.window")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.columns.updateStatus")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rewards.map((reward) => {
                  const normalizedStatus = reward.normalizedStatus();
                  const statusValue = isRewardStatus(normalizedStatus)
                    ? normalizedStatus
                    : ("DRAFT" as RewardStatus);

                  return (
                    <tr
                      key={reward.id}
                      className="text-slate-700 dark:text-slate-200"
                    >
                      <td className="px-4 py-3 font-medium">{reward.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {reward.slug || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {t(`rewards.types.${reward.normalizedType()}`, {
                          defaultValue: reward.type,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {isBonusPointsRewardType(reward.normalizedType())
                          ? t("rewards.freeClaim")
                          : (reward.pointsCost ?? "—")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusClassName(normalizedStatus)}>
                          {t(`rewards.statuses.${normalizedStatus}`, {
                            defaultValue: reward.status,
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>{formatDate(reward.startsAt)}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(reward.endsAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[10rem] flex-col gap-1">
                          <select
                            className={inputClassName}
                            value={statusValue}
                            onChange={(event) =>
                              void handleStatusChange(
                                reward.id,
                                event.target.value
                              )
                            }
                            aria-label={t("rewards.columns.updateStatus")}
                          >
                            {REWARD_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {t(`rewards.statuses.${status}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/rewards/${reward.id}`}>
                          <Button variant="secondary" size="sm">
                            {t("rewards.actions.edit")}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("rewards.redemptions.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("rewards.redemptions.description")}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshRedemptions}
            disabled={isLoading}
          >
            {t("common.refresh")}
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            className={inputClassName}
            value={redemptionRewardFilter}
            onChange={(event) => setRedemptionRewardFilter(event.target.value)}
            aria-label={t("rewards.redemptions.filterReward")}
          >
            <option value="">{t("rewards.redemptions.allRewards")}</option>
            {rewards.map((reward) => (
              <option key={reward.id} value={reward.id}>
                {reward.name}
              </option>
            ))}
          </select>
          <select
            className={inputClassName}
            value={redemptionStatusFilter}
            onChange={(event) => {
              const next = event.target.value;
              if (!next) {
                setRedemptionStatusFilter("");
                return;
              }
              if (isRewardRedemptionStatus(next)) {
                setRedemptionStatusFilter(next);
              }
            }}
            aria-label={t("rewards.redemptions.filterStatus")}
          >
            <option value="">{t("rewards.redemptions.allStatuses")}</option>
            {REWARD_REDEMPTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`rewards.redemptionStatuses.${status}`)}
              </option>
            ))}
          </select>
        </div>

        {fulfillError ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {fulfillError}
          </p>
        ) : null}

        {isLoading && redemptions.length === 0 ? (
          <div className="mt-4">
            <ApiLoadingState label={t("rewards.redemptions.loading")} />
          </div>
        ) : redemptions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t("rewards.redemptions.empty")}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[56rem] w-full text-left text-sm md:min-w-full">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.redemptions.columns.code")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.redemptions.columns.reward")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.redemptions.columns.type")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.redemptions.columns.status")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.redemptions.columns.pointsSpent")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.redemptions.columns.redeemedAt")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("rewards.redemptions.columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {redemptions.map((redemption) => {
                  const normalizedStatus = redemption.normalizedStatus();

                  return (
                    <tr
                      key={redemption.redemptionId}
                      className="text-slate-700 dark:text-slate-200"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {redemption.redemptionCode}
                      </td>
                      <td className="px-4 py-3">{redemption.rewardName}</td>
                      <td className="px-4 py-3">{redemption.rewardType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={getRedemptionStatusClassName(
                            normalizedStatus
                          )}
                        >
                          {t(`rewards.redemptionStatuses.${normalizedStatus}`, {
                            defaultValue: redemption.status,
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">{redemption.pointsSpent}</td>
                      <td className="px-4 py-3">
                        {formatDate(redemption.redeemedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {redemption.canFulfill() ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              void handleFulfill(redemption.redemptionId)
                            }
                            disabled={isLoading}
                          >
                            {t("rewards.redemptions.fulfill")}
                          </Button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
