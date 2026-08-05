import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/MetricCard";
import { usePermissions } from "@/features/permissions/usePermissions";

export function DashboardPage() {
  const { t } = useTranslation();
  const { isFullAccess } = usePermissions();

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("dashboard.description")}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          title={t("dashboard.adminUsersCard")}
          value={t("dashboard.exampleValue")}
          subtitle={t("dashboard.adminUsersHint")}
          variant="primary"
        />
        <MetricCard
          title={t("dashboard.adminRolesCard")}
          value={t("dashboard.exampleValue")}
          subtitle={t("dashboard.adminRolesHint")}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("dashboard.nextStepsTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("dashboard.nextStepsText")}
        </p>
        {isFullAccess ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/admin-users">
              <Button variant="secondary">{t("dashboard.openAdminUsers")}</Button>
            </Link>
            <Link to="/admin-roles">
              <Button>{t("dashboard.openAdminRoles")}</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
