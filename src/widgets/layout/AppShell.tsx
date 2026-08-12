import { memo, type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/motion/PageTransition";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import {
  PAGE_PERMISSIONS,
  usePermissions,
} from "@/features/permissions/usePermissions";
import packageJson from "../../../package.json";

const APP_VERSION = packageJson.version;
const DESKTOP_SIDEBAR_KEY = "sidebarExpanded";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 13.5h6.5V20H4z" />
      <path d="M13.5 4H20v9.5h-6.5z" />
      <path d="M4 4h6.5v6.5H4z" />
      <path d="M13.5 16.5H20V20h-6.5z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function RolesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7z" />
      <path d="M9.5 12l1.5 1.5L14.5 10" />
    </svg>
  );
}

function PointsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8" />
      <path d="M9.5 10.5h5" />
      <path d="M9.5 13.5h5" />
    </svg>
  );
}

function CampaignsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 10v10h16V10" />
      <path d="M2 10h20" />
      <path d="M12 10V4" />
      <path d="M8 6h8" />
    </svg>
  );
}

function RewardsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M12 8l2.5 5 5.5.8-4 3.9.9 5.5L12 19.8 7.1 23.2l.9-5.5-4-3.9 5.5-.8z" />
      <path d="M5 3h14" />
      <path d="M7 3v4" />
      <path d="M17 3v4" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function CollapseIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      {expanded ? (
        <>
          <path d="M15 6l-6 6 6 6" />
          <path d="M4 4v16" />
        </>
      ) : (
        <>
          <path d="M9 6l6 6-6 6" />
          <path d="M4 4v16" />
        </>
      )}
    </svg>
  );
}

type SidebarNavItemProps = {
  to: string;
  title: ReactNode;
  meta: string;
  icon: ReactNode;
  collapsed: boolean;
  onNavigate?: () => void;
};

const SidebarNavItem = memo(function SidebarNavItem({
  to,
  title,
  meta,
  icon,
  collapsed,
  onNavigate,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      title={collapsed ? String(title) : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
          collapsed ? "justify-center" : "",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="sidebarActivePill"
              className="absolute inset-0 rounded-xl bg-white/10"
              transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.85 }}
            />
          ) : null}
          <span className="relative z-10 shrink-0">{icon}</span>
          {!collapsed ? (
            <span className="relative z-10 min-w-0">
              <span className="block truncate font-medium">{title}</span>
              <span className="block truncate text-xs text-slate-400">{meta}</span>
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
});

type SidebarContentProps = {
  collapsed: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
};

function SidebarContent({
  collapsed,
  showCloseButton = false,
  onClose,
  onNavigate,
}: SidebarContentProps) {
  const { t } = useTranslation();
  const { canAccess } = usePermissions();

  return (
    <>
      <div className="flex items-start justify-between gap-2 border-b border-white/10 px-4 py-5">
        <div className={collapsed ? "w-full" : "min-w-0"}>
          {collapsed ? (
            <div className="flex justify-center text-lg font-bold">
              {t("shell.brandTitle").slice(0, 1)}
            </div>
          ) : (
            <div>
              <div className="text-lg font-bold tracking-tight">
                {t("shell.brandTitle")}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {t("shell.brandSubtitle")}
              </div>
            </div>
          )}
        </div>
        {showCloseButton ? (
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label={t("shell.closeMenu")}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="px-4 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {t("shell.mainMenu")}
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {canAccess(PAGE_PERMISSIONS.dashboard) ? (
          <SidebarNavItem
            to="/dashboard"
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={<DashboardIcon />}
            title={t("shell.dashboardTitle")}
            meta={t("shell.dashboardMeta")}
          />
        ) : null}
        {canAccess(PAGE_PERMISSIONS.points) ? (
          <SidebarNavItem
            to="/points"
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={<PointsIcon />}
            title={t("shell.pointsTitle")}
            meta={t("shell.pointsMeta")}
          />
        ) : null}
        {canAccess(PAGE_PERMISSIONS.campaigns) ? (
          <SidebarNavItem
            to="/campaigns"
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={<CampaignsIcon />}
            title={t("shell.campaignsTitle")}
            meta={t("shell.campaignsMeta")}
          />
        ) : null}
        {canAccess(PAGE_PERMISSIONS.rewards) ? (
          <SidebarNavItem
            to="/rewards"
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={<RewardsIcon />}
            title={t("shell.rewardsTitle")}
            meta={t("shell.rewardsMeta")}
          />
        ) : null}
        {canAccess(PAGE_PERMISSIONS.adminUsers) ? (
          <SidebarNavItem
            to="/admin-users"
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={<UsersIcon />}
            title={t("shell.adminUsersTitle")}
            meta={t("shell.adminUsersMeta")}
          />
        ) : null}
        {canAccess(PAGE_PERMISSIONS.adminRoles) ? (
          <SidebarNavItem
            to="/admin-roles"
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={<RolesIcon />}
            title={t("shell.adminRolesTitle")}
            meta={t("shell.adminRolesMeta")}
          />
        ) : null}
        {canAccess(PAGE_PERMISSIONS.customers) ? (
          <SidebarNavItem
            to="/customers"
            collapsed={collapsed}
            onNavigate={onNavigate}
            icon={<CustomersIcon />}
            title={t("shell.customersTitle")}
            meta={t("shell.customersMeta")}
          />
        ) : null}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        {!collapsed ? (
          <>
            <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {t("shell.workspace")}
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-medium">{t("shell.workspaceTitle")}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {t("shell.workspaceText")}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                {t("shell.appVersion", { version: APP_VERSION })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-[10px] text-slate-500">
            v{APP_VERSION}
          </div>
        )}
      </div>
    </>
  );
}

export function AppShell() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isFullAccess, resolvedRoleName } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserName = user?.nickname || user?.name || t("shell.userFallback");

  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    const storedValue = window.localStorage.getItem(DESKTOP_SIDEBAR_KEY);
    return storedValue === null ? true : storedValue === "true";
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      DESKTOP_SIDEBAR_KEY,
      String(isDesktopSidebarExpanded)
    );
  }, [isDesktopSidebarExpanded]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileNavOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile / tablet backdrop */}
      {isMobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
          aria-label={t("shell.closeMenu")}
          onClick={closeMobileNav}
        />
      ) : null}

      {/* Mobile / tablet drawer */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] max-w-full flex-col bg-shop-sidebar text-shop-sidebar-fg shadow-xl transition-transform duration-200 lg:hidden",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!isMobileNavOpen}
      >
        <SidebarContent
          collapsed={false}
          showCloseButton
          onClose={closeMobileNav}
          onNavigate={closeMobileNav}
        />
      </aside>

      {/* Desktop persistent sidebar */}
      <aside
        className={[
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-shop-sidebar-border bg-shop-sidebar text-shop-sidebar-fg transition-[width] duration-200 lg:flex",
          isDesktopSidebarExpanded ? "w-72" : "w-[4.5rem]",
        ].join(" ")}
      >
        <SidebarContent collapsed={!isDesktopSidebarExpanded} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-slate-600 lg:hidden dark:text-slate-300"
                aria-label={t("shell.openMenu")}
                aria-expanded={isMobileNavOpen}
                onClick={() => setIsMobileNavOpen(true)}
              >
                <MenuIcon />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden shrink-0 text-slate-600 lg:inline-flex dark:text-slate-300"
                aria-label={t("shell.toggleSidebar")}
                aria-pressed={isDesktopSidebarExpanded}
                onClick={() =>
                  setIsDesktopSidebarExpanded((prev) => !prev)
                }
              >
                <CollapseIcon expanded={isDesktopSidebarExpanded} />
              </Button>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("shell.topbarTitle")}
                </div>
                <div className="hidden truncate text-sm text-slate-600 sm:block dark:text-slate-300">
                  {t("shell.topbarSubtitle")}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="hidden min-w-0 text-right md:block">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t("shell.signedInAs")}
                </div>
                <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {currentUserName}
                </div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {isFullAccess
                    ? t("shell.fullAccessRole")
                    : resolvedRoleName || t("shell.userRole")}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={handleLogout}
              >
                <span className="sm:hidden">{t("shell.logoutShort")}</span>
                <span className="hidden sm:inline">{t("shell.logout")}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
