import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiLoadingState } from "@/components/ApiLoadingState";
import { Button } from "@/components/ui/Button";
import { useAdminRoleManagement } from "@/core/presentation/hooks/useAdminRoleManagement";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-shop-ring dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

export function AdminRolesPage() {
  const { t } = useTranslation();
  const {
    roles,
    availablePermissions,
    isLoading,
    error,
    loadRoles,
    loadAvailablePermissions,
    createRole,
    clearError,
  } = useAdminRoleManagement();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = () => {
    clearError();
    void loadRoles().catch(() => undefined);
    void loadAvailablePermissions().catch(() => undefined);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission]
    );
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    try {
      await createRole({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: selectedPermissions,
      });
      setName("");
      setDescription("");
      setSelectedPermissions([]);
      await loadRoles();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("adminRoles.createError")
      );
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("adminRoles.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("adminRoles.description")}
          </p>
        </div>
        <Button variant="secondary" isLoading={isLoading} onClick={refresh}>
          {isLoading ? t("common.refreshing") : t("common.refresh")}
        </Button>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("adminRoles.createTitle")}
        </h2>
        <form className="mt-4 space-y-4" onSubmit={handleCreate}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputClassName}
              placeholder={t("adminRoles.fields.name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <input
              className={inputClassName}
              placeholder={t("adminRoles.fields.description")}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("adminRoles.fields.permissions")}
            </legend>
            {availablePermissions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("adminRoles.permissionsEmpty")}
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {availablePermissions.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                    <span className="truncate">{permission}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          {(formError || error) && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {formError || error}
            </p>
          )}

          <Button type="submit" isLoading={isLoading}>
            {t("adminRoles.createSubmit")}
          </Button>
        </form>
      </div>

      {isLoading && roles.length === 0 ? (
        <ApiLoadingState label={t("adminRoles.loading")} />
      ) : roles.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("adminRoles.empty")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t("adminRoles.total", { count: roles.length })}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminRoles.columns.name")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminRoles.columns.description")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminRoles.columns.permissions")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminRoles.columns.system")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {roles.map((role) => (
                  <tr
                    key={role.id}
                    className="text-slate-700 dark:text-slate-200"
                  >
                    <td className="px-4 py-3 font-medium">{role.name}</td>
                    <td className="px-4 py-3">{role.description || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-md flex-wrap gap-1">
                        {role.permissions.map((permission) => (
                          <span
                            key={`${role.id}-${permission}`}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {role.isSystem
                        ? t("adminRoles.systemYes")
                        : t("adminRoles.systemNo")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
