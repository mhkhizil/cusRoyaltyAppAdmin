import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiLoadingState } from "@/components/ApiLoadingState";
import { Button } from "@/components/ui/Button";
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  isCampaignStatus,
  isCampaignType,
  type CampaignStatus,
} from "@/core/domain/entities/Campaign";
import { useCampaignManagement } from "@/core/presentation/hooks/useCampaignManagement";

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

export function CampaignsPage() {
  const { t } = useTranslation();
  const {
    campaigns,
    lastCreateResult,
    isLoading,
    error,
    loadCampaigns,
    createCampaign,
    updateCampaignStatus,
    clearError,
    clearCreateResult,
  } = useCampaignManagement();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [type, setType] = useState<(typeof CAMPAIGN_TYPES)[number]>("BIRTHDAY");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumPurchase, setMinimumPurchase] = useState("");
  const [birthdayWindowDays, setBirthdayWindowDays] = useState("7");
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [statusErrors, setStatusErrors] = useState<Record<string, string>>({});

  const refresh = () => {
    clearError();
    clearCreateResult();
    void loadCampaigns().catch(() => undefined);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    clearCreateResult();

    const parsedDiscount = Number(discountValue);
    const parsedMinimum = minimumPurchase.trim()
      ? Number(minimumPurchase)
      : 0;
    const parsedBirthdayWindow = birthdayWindowDays.trim()
      ? Number(birthdayWindowDays)
      : 0;

    if (!isCampaignType(type)) {
      setFormError(t("campaigns.createError"));
      return;
    }

    try {
      await createCampaign({
        name: name.trim(),
        slug: slug.trim(),
        type,
        discountType: "PERCENTAGE",
        discountValue: parsedDiscount,
        minimumPurchase: parsedMinimum,
        birthdayWindowDays: parsedBirthdayWindow,
        isDiscoverable,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      });

      setName("");
      setSlug("");
      setSlugTouched(false);
      setType("BIRTHDAY");
      setDiscountValue("");
      setMinimumPurchase("");
      setBirthdayWindowDays("7");
      setIsDiscoverable(true);
      setStartsAt("");
      setEndsAt("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("campaigns.createError")
      );
    }
  };

  const handleStatusChange = async (campaignId: string, nextStatus: string) => {
    if (!isCampaignStatus(nextStatus)) return;

    setStatusErrors((prev) => {
      const next = { ...prev };
      delete next[campaignId];
      return next;
    });

    try {
      await updateCampaignStatus(campaignId, { status: nextStatus });
    } catch (err) {
      setStatusErrors((prev) => ({
        ...prev,
        [campaignId]:
          err instanceof Error
            ? err.message
            : t("campaigns.statusUpdateError"),
      }));
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {t("campaigns.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("campaigns.description")}
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

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("campaigns.createTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("campaigns.createSubtitle")}
        </p>

        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleCreate}>
          <input
            className={`${inputClassName} sm:col-span-2`}
            placeholder={t("campaigns.fields.name")}
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
          />
          <input
            className={`${inputClassName} sm:col-span-2`}
            placeholder={t("campaigns.fields.slug")}
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            required
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
          />
          {type === "BIRTHDAY" ? (
            <input
              className={inputClassName}
              type="number"
              min="0"
              placeholder={t("campaigns.fields.birthdayWindowDays")}
              value={birthdayWindowDays}
              onChange={(event) => setBirthdayWindowDays(event.target.value)}
            />
          ) : (
            <div className="hidden sm:block" />
          )}
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 sm:col-span-2 dark:border-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={isDiscoverable}
              onChange={(event) => setIsDiscoverable(event.target.checked)}
            />
            <span>{t("campaigns.fields.isDiscoverable")}</span>
          </label>
          <input
            className={inputClassName}
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            aria-label={t("campaigns.fields.startsAt")}
          />
          <input
            className={inputClassName}
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            aria-label={t("campaigns.fields.endsAt")}
          />

          {(formError || error) && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {formError || error}
            </p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" isLoading={isLoading}>
              {t("campaigns.createSubmit")}
            </Button>
          </div>
        </form>

        {lastCreateResult ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            {t("campaigns.createSuccess", {
              id: lastCreateResult.id,
              pointsAwarded: lastCreateResult.pointsAwarded,
              recipients: lastCreateResult.recipients,
            })}
          </div>
        ) : null}
      </div>

      {isLoading && campaigns.length === 0 ? (
        <ApiLoadingState label={t("campaigns.loading")} />
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("campaigns.empty")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t("campaigns.total", { count: campaigns.length })}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[48rem] w-full text-left text-sm md:min-w-full">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {t("campaigns.columns.name")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("campaigns.columns.type")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("campaigns.columns.status")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("campaigns.columns.window")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("campaigns.columns.discoverable")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("campaigns.columns.updateStatus")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {campaigns.map((campaign) => {
                  const normalizedStatus = campaign.normalizedStatus();
                  const statusValue = isCampaignStatus(normalizedStatus)
                    ? normalizedStatus
                    : ("DRAFT" as CampaignStatus);

                  return (
                    <tr
                      key={campaign.id}
                      className="text-slate-700 dark:text-slate-200"
                    >
                      <td className="px-4 py-3 font-medium">{campaign.name}</td>
                      <td className="px-4 py-3">
                        {t(`campaigns.types.${campaign.normalizedType()}`, {
                          defaultValue: campaign.type,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusClassName(normalizedStatus)}>
                          {t(`campaigns.statuses.${normalizedStatus}`, {
                            defaultValue: campaign.status,
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>{formatDate(campaign.startsAt)}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(campaign.endsAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {campaign.isDiscoverable
                          ? t("campaigns.discoverableYes")
                          : t("campaigns.discoverableNo")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[10rem] flex-col gap-1">
                          <select
                            className={inputClassName}
                            value={statusValue}
                            onChange={(event) =>
                              void handleStatusChange(
                                campaign.id,
                                event.target.value
                              )
                            }
                            disabled={isLoading}
                            aria-label={t("campaigns.columns.updateStatus")}
                          >
                            {CAMPAIGN_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {t(`campaigns.statuses.${status}`)}
                              </option>
                            ))}
                          </select>
                          {statusErrors[campaign.id] ? (
                            <span className="text-xs text-red-600 dark:text-red-300">
                              {statusErrors[campaign.id]}
                            </span>
                          ) : null}
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
