import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ApiLoadingState } from "@/components/ApiLoadingState";
import { Button } from "@/components/ui/Button";
import { ImageFilePicker } from "@/components/ui/ImageFilePicker";
import {
  isBonusPointsRewardType,
  isRewardType,
  type RewardDetail,
} from "@/core/domain/entities/Reward";
import { useRewardManagement } from "@/core/presentation/hooks/useRewardManagement";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-shop-ring dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

function toDatetimeLocalValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function parseOptionalNumber(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function RewardDetailPage() {
  const { rewardId = "" } = useParams<{ rewardId: string }>();
  const { t } = useTranslation();
  const {
    getRewardById,
    updateReward,
    uploadRewardImage,
    deleteRewardImage,
    isLoading,
    error,
    clearError,
  } = useRewardManagement();

  const [reward, setReward] = useState<RewardDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const hydrateForm = (detail: RewardDetail) => {
    setReward(detail);
    setName(detail.name);
    setSlug(detail.slug || "");
    setDescription(detail.description || "");
    setImageFile(null);
    setPointsCost(
      detail.pointsCost === null || detail.pointsCost === undefined
        ? ""
        : String(detail.pointsCost)
    );
    setBonusPoints(
      detail.bonusPoints === null || detail.bonusPoints === undefined
        ? ""
        : String(detail.bonusPoints)
    );
    setDiscountValue(
      detail.discountValue === null || detail.discountValue === undefined
        ? ""
        : String(detail.discountValue)
    );
    setFreeProductId(detail.freeProductId || "");
    setMinimumTierId(detail.minimumTierId || "");
    setUnlockThreshold(
      detail.unlockThreshold === null || detail.unlockThreshold === undefined
        ? ""
        : String(detail.unlockThreshold)
    );
    setStockQuantity(
      detail.stockQuantity === null || detail.stockQuantity === undefined
        ? ""
        : String(detail.stockQuantity)
    );
    setPerUserLimit(
      detail.perUserLimit === null || detail.perUserLimit === undefined
        ? ""
        : String(detail.perUserLimit)
    );
    setStartsAt(toDatetimeLocalValue(detail.startsAt));
    setEndsAt(toDatetimeLocalValue(detail.endsAt));
  };

  useEffect(() => {
    if (!rewardId) {
      setLoadError(t("rewards.details.notFound"));
      setIsLoadingDetail(false);
      return;
    }

    setIsLoadingDetail(true);
    setLoadError(null);
    clearError();

    void getRewardById(rewardId)
      .then(hydrateForm)
      .catch((err) => {
        setReward(null);
        setLoadError(
          err instanceof Error ? err.message : t("rewards.details.loadError")
        );
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });
  }, [rewardId, clearError, getRewardById, t]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSaveSuccess(false);
    clearError();

    if (!rewardId || !reward) return;

    if (reward.isArchived()) {
      setFormError(t("rewards.details.archivedLocked"));
      return;
    }

    const rewardType = reward.normalizedType();
    const isBonusPoints = isBonusPointsRewardType(rewardType);

    const parsedPointsCost = parseOptionalNumber(pointsCost);
    if (!isBonusPoints && parsedPointsCost === undefined) {
      setFormError(t("rewards.validation.pointsCostRequired"));
      return;
    }

    const parsedBonusPoints = parseOptionalNumber(bonusPoints);
    if (
      isBonusPoints &&
      (parsedBonusPoints === undefined ||
        parsedBonusPoints === null ||
        parsedBonusPoints <= 0)
    ) {
      setFormError(t("rewards.validation.bonusPointsRequired"));
      return;
    }

    if (!isBonusPoints && parsedBonusPoints === undefined) {
      setFormError(t("rewards.details.updateError"));
      return;
    }

    const parsedDiscountValue = parseOptionalNumber(discountValue);
    if (parsedDiscountValue === undefined) {
      setFormError(t("rewards.details.updateError"));
      return;
    }

    const parsedUnlockThreshold = parseOptionalNumber(unlockThreshold);
    if (parsedUnlockThreshold === undefined) {
      setFormError(t("rewards.details.updateError"));
      return;
    }

    const parsedStockQuantity = parseOptionalNumber(stockQuantity);
    if (parsedStockQuantity === undefined) {
      setFormError(t("rewards.details.updateError"));
      return;
    }

    const parsedPerUserLimit = parseOptionalNumber(perUserLimit);
    if (parsedPerUserLimit === undefined) {
      setFormError(t("rewards.details.updateError"));
      return;
    }

    try {
      const updated = await updateReward(
        rewardId,
        {
          name,
          slug,
          description: description.trim() || null,
          pointsCost: isBonusPoints
            ? 0
            : parsedPointsCost === null
              ? undefined
              : parsedPointsCost,
          bonusPoints: parsedBonusPoints,
          discountValue: parsedDiscountValue,
          freeProductId: freeProductId.trim() || null,
          minimumTierId: minimumTierId.trim() || null,
          unlockMetric: "NONE",
          unlockThreshold:
            parsedUnlockThreshold === null ? undefined : parsedUnlockThreshold,
          stockQuantity: parsedStockQuantity,
          perUserLimit: parsedPerUserLimit,
          startsAt: startsAt || null,
          endsAt: endsAt || null,
          file: imageFile ?? undefined,
        },
        rewardType
      );
      hydrateForm(updated);
      setSaveSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("rewards.details.updateError")
      );
    }
  };

  const handleUploadImage = async () => {
    if (!rewardId || !imageFile || reward?.isArchived()) return;

    setFormError(null);
    setSaveSuccess(false);
    clearError();

    try {
      const updated = await uploadRewardImage(rewardId, imageFile);
      hydrateForm(updated);
      setSaveSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("rewards.details.imageUploadError")
      );
    }
  };

  const handleClearImage = async () => {
    if (!rewardId || !reward?.imageUrl || reward.isArchived()) return;

    setFormError(null);
    setSaveSuccess(false);
    clearError();

    try {
      const updated = await deleteRewardImage(rewardId);
      hydrateForm(updated);
      setSaveSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("rewards.details.imageClearError")
      );
    }
  };

  if (isLoadingDetail) {
    return (
      <section className="mx-auto max-w-3xl">
        <ApiLoadingState label={t("rewards.details.loading")} />
      </section>
    );
  }

  if (!reward) {
    return (
      <section className="mx-auto max-w-3xl space-y-4">
        <Link to="/rewards">
          <Button variant="secondary">{t("rewards.details.back")}</Button>
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loadError || t("rewards.details.notFound")}
        </div>
      </section>
    );
  }

  const rewardType = reward.normalizedType();
  const displayType = isRewardType(rewardType) ? rewardType : reward.type;
  const isBonusPoints = isBonusPointsRewardType(displayType);
  const hasLegacyPointsCost =
    isBonusPoints &&
    reward.pointsCost !== null &&
    reward.pointsCost !== undefined &&
    reward.pointsCost > 0;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/rewards"
            className="text-sm font-medium text-shop-primary hover:underline"
          >
            {t("rewards.details.back")}
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("rewards.details.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {reward.name} ·{" "}
            {t(`rewards.statuses.${reward.normalizedStatus()}`, {
              defaultValue: reward.status,
            })}{" "}
            · {t(`rewards.types.${displayType}`, { defaultValue: reward.type })}
          </p>
        </div>
      </header>

      {hasLegacyPointsCost ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          {t("rewards.details.legacyPointsCostWarning", {
            pointsCost: reward.pointsCost,
          })}
        </div>
      ) : null}

      {reward.isArchived() ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          {t("rewards.details.archivedLocked")}
        </div>
      ) : null}

      {error || formError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {formError || error}
        </div>
      ) : null}

      <form
        onSubmit={(event) => void handleSave(event)}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputClassName}
            placeholder={t("rewards.fields.name")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={reward.isArchived()}
            required
          />
          <input
            className={inputClassName}
            placeholder={t("rewards.fields.slug")}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            disabled={reward.isArchived()}
            required
          />
          <textarea
            className={`${inputClassName} sm:col-span-2`}
            placeholder={t("rewards.fields.description")}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={reward.isArchived()}
            rows={3}
          />
          <div className="sm:col-span-2">
            <ImageFilePicker
              value={imageFile}
              onChange={setImageFile}
              disabled={isLoading || reward.isArchived()}
              chooseLabel={t("rewards.fields.chooseImage")}
              clearSelectionLabel={t("rewards.fields.clearSelection")}
              hint={t("rewards.fields.imageHint")}
              previewAlt={t("rewards.fields.imagePreviewAlt")}
              currentImageUrl={reward.imageUrl}
              currentImageAlt={reward.name}
              noCurrentImageLabel={t("rewards.details.noImage")}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {imageFile ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLoading || reward.isArchived()}
                  onClick={() => void handleUploadImage()}
                >
                  {t("rewards.details.uploadImage")}
                </Button>
              ) : null}
              {reward.imageUrl ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoading || reward.isArchived()}
                  onClick={() => void handleClearImage()}
                >
                  {t("rewards.details.clearImage")}
                </Button>
              ) : null}
            </div>
          </div>
          {isBonusPoints ? (
            <div className="space-y-2 sm:col-span-2">
              <input
                className={inputClassName}
                type="number"
                min={1}
                step="1"
                placeholder={t("rewards.fields.bonusPoints")}
                value={bonusPoints}
                onChange={(event) => setBonusPoints(event.target.value)}
                disabled={reward.isArchived()}
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
                disabled={reward.isArchived()}
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("rewards.fields.pointsCostHint")}
              </p>
            </div>
          )}
          {displayType === "DISCOUNT" ? (
            <input
              className={inputClassName}
              type="number"
              min={0}
              step="any"
              placeholder={t("rewards.fields.discountValue")}
              value={discountValue}
              onChange={(event) => setDiscountValue(event.target.value)}
              disabled={reward.isArchived()}
            />
          ) : null}
          {displayType === "FREE_PRODUCT" ? (
            <input
              className={inputClassName}
              placeholder={t("rewards.fields.freeProductId")}
              value={freeProductId}
              onChange={(event) => setFreeProductId(event.target.value)}
              disabled={reward.isArchived()}
            />
          ) : null}
          <input
            className={inputClassName}
            placeholder={t("rewards.fields.minimumTierId")}
            value={minimumTierId}
            onChange={(event) => setMinimumTierId(event.target.value)}
            disabled={reward.isArchived()}
          />
          <input
            className={inputClassName}
            type="number"
            min={0}
            step="any"
            placeholder={t("rewards.fields.unlockThreshold")}
            value={unlockThreshold}
            onChange={(event) => setUnlockThreshold(event.target.value)}
            disabled={reward.isArchived()}
          />
          <input
            className={inputClassName}
            type="number"
            min={0}
            step="1"
            placeholder={t("rewards.fields.stockQuantity")}
            value={stockQuantity}
            onChange={(event) => setStockQuantity(event.target.value)}
            disabled={reward.isArchived()}
          />
          <input
            className={inputClassName}
            type="number"
            min={0}
            step="1"
            placeholder={t("rewards.fields.perUserLimit")}
            value={perUserLimit}
            onChange={(event) => setPerUserLimit(event.target.value)}
            disabled={reward.isArchived()}
          />
          <input
            className={inputClassName}
            type="datetime-local"
            aria-label={t("rewards.fields.startsAt")}
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            disabled={reward.isArchived()}
          />
          <input
            className={inputClassName}
            type="datetime-local"
            aria-label={t("rewards.fields.endsAt")}
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            disabled={reward.isArchived()}
          />

          <div className="grid gap-2 text-sm text-slate-500 dark:text-slate-400 sm:col-span-2 sm:grid-cols-2">
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {t("rewards.details.createdAt")}
              </span>
              <div>{formatDate(reward.createdAt)}</div>
            </div>
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {t("rewards.details.updatedAt")}
              </span>
              <div>{formatDate(reward.updatedAt)}</div>
            </div>
          </div>
        </div>

        {saveSuccess ? (
          <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">
            {t("rewards.details.updateSuccess")}
          </p>
        ) : null}

        <div className="mt-4">
          <Button type="submit" disabled={isLoading || reward.isArchived()}>
            {t("rewards.details.save")}
          </Button>
        </div>
      </form>
    </section>
  );
}
