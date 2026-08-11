import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ApiLoadingState } from "@/components/ApiLoadingState";
import { Button } from "@/components/ui/Button";
import {
  CAMPAIGN_TYPES,
  isCampaignType,
  type CampaignDetail,
} from "@/core/domain/entities/Campaign";
import { useBranchManagement } from "@/core/presentation/hooks/useBranchManagement";
import { useCampaignManagement } from "@/core/presentation/hooks/useCampaignManagement";

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

export function CampaignDetailPage() {
  const { campaignId = "" } = useParams<{ campaignId: string }>();
  const { t } = useTranslation();
  const {
    getCampaignById,
    updateCampaign,
    isLoading,
    error,
    clearError,
  } = useCampaignManagement();
  const {
    branches,
    isLoading: isBranchesLoading,
    loadBranches,
  } = useBranchManagement();

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<(typeof CAMPAIGN_TYPES)[number]>("BIRTHDAY");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumPurchase, setMinimumPurchase] = useState("");
  const [maximumDiscount, setMaximumDiscount] = useState("");
  const [birthdayWindowDays, setBirthdayWindowDays] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");
  const [totalLimit, setTotalLimit] = useState("");
  const [minimumTierId, setMinimumTierId] = useState("");
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const hydrateForm = (detail: CampaignDetail) => {
    setCampaign(detail);
    setName(detail.name);
    setSlug(detail.slug || "");
    setDescription(detail.description || "");
    const nextType = detail.normalizedType();
    setType(isCampaignType(nextType) ? nextType : "BIRTHDAY");
    setDiscountValue(
      detail.discountValue === null || detail.discountValue === undefined
        ? ""
        : String(detail.discountValue)
    );
    setMinimumPurchase(
      detail.minimumPurchase === null || detail.minimumPurchase === undefined
        ? ""
        : String(detail.minimumPurchase)
    );
    setMaximumDiscount(
      detail.maximumDiscount === null || detail.maximumDiscount === undefined
        ? ""
        : String(detail.maximumDiscount)
    );
    setBirthdayWindowDays(
      detail.birthdayWindowDays === null ||
        detail.birthdayWindowDays === undefined
        ? ""
        : String(detail.birthdayWindowDays)
    );
    setPerUserLimit(
      detail.perUserLimit === null || detail.perUserLimit === undefined
        ? ""
        : String(detail.perUserLimit)
    );
    setTotalLimit(
      detail.totalLimit === null || detail.totalLimit === undefined
        ? ""
        : String(detail.totalLimit)
    );
    setMinimumTierId(detail.minimumTierId || "");
    setSelectedLocationIds([...detail.locationIds]);
    setIsDiscoverable(detail.isDiscoverable);
    setStartsAt(toDatetimeLocalValue(detail.startsAt));
    setEndsAt(toDatetimeLocalValue(detail.endsAt));
  };

  useEffect(() => {
    void loadBranches().catch(() => undefined);
  }, [loadBranches]);

  useEffect(() => {
    if (!campaignId) {
      setLoadError(t("campaigns.details.notFound"));
      setIsLoadingDetail(false);
      return;
    }

    setIsLoadingDetail(true);
    setLoadError(null);
    clearError();

    void getCampaignById(campaignId)
      .then(hydrateForm)
      .catch((err) => {
        setCampaign(null);
        setLoadError(
          err instanceof Error ? err.message : t("campaigns.details.loadError")
        );
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });
  }, [campaignId, clearError, getCampaignById, t]);

  const toggleLocation = (locationId: string) => {
    setSelectedLocationIds((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!campaignId || !campaign) return;

    setFormError(null);
    setSaveSuccess(false);

    if (campaign.isArchived()) {
      setFormError(t("campaigns.details.archivedLocked"));
      return;
    }

    if (!isCampaignType(type)) {
      setFormError(t("campaigns.details.updateError"));
      return;
    }

    const parsedDiscount = Number(discountValue);
    const parsedMinimum = parseOptionalNumber(minimumPurchase);
    const parsedMaximum = parseOptionalNumber(maximumDiscount);
    const parsedBirthday = parseOptionalNumber(birthdayWindowDays);
    const parsedPerUser = parseOptionalNumber(perUserLimit);
    const parsedTotal = parseOptionalNumber(totalLimit);

    if (parsedDiscount === undefined || Number.isNaN(parsedDiscount)) {
      setFormError(t("campaigns.details.updateError"));
      return;
    }

    try {
      const updated = await updateCampaign(campaignId, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        type,
        discountType: "PERCENTAGE",
        discountValue: parsedDiscount,
        minimumPurchase: parsedMinimum ?? 0,
        maximumDiscount: parsedMaximum === undefined ? null : parsedMaximum,
        birthdayWindowDays: parsedBirthday === undefined ? null : parsedBirthday,
        perUserLimit:
          parsedPerUser === null || parsedPerUser === undefined
            ? undefined
            : parsedPerUser,
        totalLimit: parsedTotal === undefined ? null : parsedTotal,
        minimumTierId: minimumTierId.trim() || null,
        locationIds: selectedLocationIds,
        isDiscoverable,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      });
      hydrateForm(updated);
      setSaveSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("campaigns.details.updateError")
      );
    }
  };

  if (isLoadingDetail) {
    return (
      <section className="mx-auto max-w-4xl">
        <ApiLoadingState label={t("campaigns.details.loading")} />
      </section>
    );
  }

  if (!campaign) {
    return (
      <section className="mx-auto max-w-4xl space-y-4">
        <Link to="/campaigns">
          <Button variant="secondary">{t("campaigns.details.back")}</Button>
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError || t("campaigns.details.notFound")}
        </div>
      </section>
    );
  }

  const archived = campaign.isArchived();

  return (
    <section className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/campaigns"
            className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {t("campaigns.details.back")}
          </Link>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {t("campaigns.details.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {campaign.name} · {t(`campaigns.statuses.${campaign.normalizedStatus()}`, {
              defaultValue: campaign.status,
            })}
          </p>
        </div>
      </header>

      {archived ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          {t("campaigns.details.archivedLocked")}
        </div>
      ) : null}

      <form
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5 dark:border-slate-800 dark:bg-slate-900"
        onSubmit={handleSave}
      >
        <input
          className={`${inputClassName} sm:col-span-2`}
          placeholder={t("campaigns.fields.name")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={archived}
          required
        />
        <input
          className={`${inputClassName} sm:col-span-2`}
          placeholder={t("campaigns.fields.slug")}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          disabled={archived}
          required
        />
        <textarea
          className={`${inputClassName} min-h-[5rem] sm:col-span-2`}
          placeholder={t("campaigns.fields.description")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={archived}
        />
        <select
          className={inputClassName}
          value={type}
          onChange={(event) => {
            const nextType = event.target.value.toUpperCase();
            if (isCampaignType(nextType)) {
              setType(nextType);
            }
          }}
          disabled={archived}
          aria-label={t("campaigns.fields.type")}
        >
          {CAMPAIGN_TYPES.map((campaignType) => (
            <option key={campaignType} value={campaignType}>
              {t(`campaigns.types.${campaignType}`)}
            </option>
          ))}
        </select>
        <input
          className={inputClassName}
          type="number"
          min="0"
          step="0.01"
          placeholder={t("campaigns.fields.discountValue")}
          value={discountValue}
          onChange={(event) => setDiscountValue(event.target.value)}
          disabled={archived}
          required
        />
        <input
          className={inputClassName}
          type="number"
          min="0"
          step="0.01"
          placeholder={t("campaigns.fields.minimumPurchase")}
          value={minimumPurchase}
          onChange={(event) => setMinimumPurchase(event.target.value)}
          disabled={archived}
        />
        <input
          className={inputClassName}
          type="number"
          min="0"
          step="0.01"
          placeholder={t("campaigns.fields.maximumDiscount")}
          value={maximumDiscount}
          onChange={(event) => setMaximumDiscount(event.target.value)}
          disabled={archived}
        />
        {type === "BIRTHDAY" ? (
          <input
            className={inputClassName}
            type="number"
            min="0"
            placeholder={t("campaigns.fields.birthdayWindowDays")}
            value={birthdayWindowDays}
            onChange={(event) => setBirthdayWindowDays(event.target.value)}
            disabled={archived}
          />
        ) : null}
        <input
          className={inputClassName}
          type="number"
          min="0"
          placeholder={t("campaigns.fields.perUserLimit")}
          value={perUserLimit}
          onChange={(event) => setPerUserLimit(event.target.value)}
          disabled={archived}
        />
        <input
          className={inputClassName}
          type="number"
          min="0"
          placeholder={t("campaigns.fields.totalLimit")}
          value={totalLimit}
          onChange={(event) => setTotalLimit(event.target.value)}
          disabled={archived}
        />
        <input
          className={`${inputClassName} sm:col-span-2`}
          placeholder={t("campaigns.fields.minimumTierId")}
          value={minimumTierId}
          onChange={(event) => setMinimumTierId(event.target.value)}
          disabled={archived}
        />
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("campaigns.fields.locationIds")}
          </legend>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            {t("campaigns.fields.locationIdsEditHint")}
          </p>
          {branches.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isBranchesLoading
                ? t("campaigns.branches.loading")
                : t("campaigns.branches.empty")}
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
                    checked={selectedLocationIds.includes(branch.id)}
                    onChange={() => toggleLocation(branch.id)}
                    disabled={archived}
                  />
                  <span className="truncate">{branch.displayLabel}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 sm:col-span-2 dark:border-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={isDiscoverable}
            onChange={(event) => setIsDiscoverable(event.target.checked)}
            disabled={archived}
          />
          <span>{t("campaigns.fields.isDiscoverable")}</span>
        </label>
        <input
          className={inputClassName}
          type="datetime-local"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          disabled={archived}
          aria-label={t("campaigns.fields.startsAt")}
        />
        <input
          className={inputClassName}
          type="datetime-local"
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
          disabled={archived}
          aria-label={t("campaigns.fields.endsAt")}
        />

        <dl className="grid gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-600 sm:col-span-2 sm:grid-cols-2 dark:border-slate-700 dark:text-slate-300">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              {t("campaigns.details.createdAt")}
            </dt>
            <dd>{formatDate(campaign.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              {t("campaigns.details.updatedAt")}
            </dt>
            <dd>{formatDate(campaign.updatedAt)}</dd>
          </div>
        </dl>

        {(formError || error) && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {formError || error}
          </p>
        )}

        {saveSuccess ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 sm:col-span-2 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {t("campaigns.details.updateSuccess")}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <Button type="submit" isLoading={isLoading} disabled={archived}>
            {t("campaigns.details.save")}
          </Button>
        </div>
      </form>
    </section>
  );
}
