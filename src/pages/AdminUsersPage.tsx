import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiLoadingState } from "@/components/ApiLoadingState";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { useAdminRoleManagement } from "@/core/presentation/hooks/useAdminRoleManagement";
import { useAdminUserManagement } from "@/core/presentation/hooks/useAdminUserManagement";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-shop-ring dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

export function AdminUsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const {
    adminUsers,
    isLoading,
    error,
    loadAdminUsers,
    createAdminUser,
    updateAdminUserRole,
    demoteAdminUser,
    clearError,
  } = useAdminUserManagement();
  const { roles, loadRoles } = useAdminRoleManagement();

  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [rowRoleDrafts, setRowRoleDrafts] = useState<Record<string, string>>(
    {}
  );

  const assignableRoles = useMemo(
    () =>
      roles.filter(
        (item) => !item.isRootSystemRole() && item.name.toUpperCase() !== "ROOT_ADMIN"
      ),
    [roles]
  );

  const refresh = () => {
    clearError();
    void loadAdminUsers().catch(() => undefined);
    void loadRoles().catch(() => undefined);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!role && assignableRoles.length > 0) {
      setRole(assignableRoles[0].name);
    }
  }, [assignableRoles, role]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    try {
      await createAdminUser({
        nickname: nickname.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        role,
      });
      setNickname("");
      setPhone("");
      setEmail("");
      setPassword("");
      await loadAdminUsers();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("adminUsers.createError")
      );
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("adminUsers.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("adminUsers.description")}
          </p>
        </div>
        <Button variant="secondary" isLoading={isLoading} onClick={refresh}>
          {isLoading ? t("common.refreshing") : t("common.refresh")}
        </Button>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("adminUsers.createTitle")}
        </h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={handleCreate}
        >
          <input
            className={inputClassName}
            placeholder={t("adminUsers.fields.nickname")}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            required
          />
          <input
            className={inputClassName}
            placeholder={t("adminUsers.fields.phone")}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
          <input
            className={inputClassName}
            type="email"
            placeholder={t("adminUsers.fields.email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className={inputClassName}
            type="password"
            placeholder={t("adminUsers.fields.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          <select
            className={`${inputClassName} sm:col-span-2`}
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required
          >
            <option value="" disabled>
              {t("adminUsers.fields.role")}
            </option>
            {assignableRoles.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          {(formError || error) && (
            <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {formError || error}
            </p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" isLoading={isLoading}>
              {t("adminUsers.createSubmit")}
            </Button>
          </div>
        </form>
      </div>

      {isLoading && adminUsers.length === 0 ? (
        <ApiLoadingState label={t("adminUsers.loading")} />
      ) : adminUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("adminUsers.empty")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t("adminUsers.total", { count: adminUsers.length })}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminUsers.columns.name")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminUsers.columns.email")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminUsers.columns.phone")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminUsers.columns.role")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminUsers.columns.status")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("adminUsers.columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {adminUsers.map((adminUser) => {
                  const isSelf = currentUser?.id === adminUser.id;
                  const isRoot = adminUser.isRootAdmin();
                  const draftRole =
                    rowRoleDrafts[adminUser.id] ||
                    adminUser.adminRoleName ||
                    adminUser.role;

                  return (
                    <tr
                      key={adminUser.id}
                      className="text-slate-700 dark:text-slate-200"
                    >
                      <td className="px-4 py-3">{adminUser.nickname}</td>
                      <td className="px-4 py-3">{adminUser.email || "—"}</td>
                      <td className="px-4 py-3">{adminUser.phone}</td>
                      <td className="px-4 py-3">
                        {isRoot || isSelf ? (
                          adminUser.adminRoleName || adminUser.role
                        ) : (
                          <select
                            className={inputClassName}
                            value={draftRole}
                            onChange={(event) =>
                              setRowRoleDrafts((prev) => ({
                                ...prev,
                                [adminUser.id]: event.target.value,
                              }))
                            }
                          >
                            {assignableRoles.map((item) => (
                              <option key={item.id} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {adminUser.isBanned
                          ? t("adminUsers.status.banned")
                          : adminUser.isActive
                            ? t("adminUsers.status.active")
                            : t("adminUsers.status.inactive")}
                      </td>
                      <td className="px-4 py-3">
                        {isRoot || isSelf ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isLoading}
                              onClick={() => {
                                void updateAdminUserRole(adminUser.id, {
                                  role: draftRole,
                                }).catch(() => undefined);
                              }}
                            >
                              {t("adminUsers.actions.updateRole")}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isLoading}
                              onClick={() => {
                                void demoteAdminUser(adminUser.id).catch(
                                  () => undefined
                                );
                              }}
                            >
                              {t("adminUsers.actions.demote")}
                            </Button>
                          </div>
                        )}
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
