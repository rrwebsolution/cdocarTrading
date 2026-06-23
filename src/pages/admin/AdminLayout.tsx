import { useEffect, useRef, useState } from "react";
import {
  Car,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { sidebarGroups as adminSidebarGroups } from "./adminData";
import type { SidebarGroup } from "./types";

type AdminLayoutProps = {
  activeRoute: string;
  children: React.ReactNode;
  onLogout: () => void;
  onNavigate: (route: string) => void;
  profileName?: string;
  profileSubtitle?: string;
  sidebarGroups?: SidebarGroup[];
};

function AdminLayout({
  activeRoute,
  children,
  onLogout,
  onNavigate,
  profileName = "Administrator",
  profileSubtitle = "CDO Car Trading IMS",
  sidebarGroups = adminSidebarGroups,
}: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileSidebarClosing, setIsMobileSidebarClosing] = useState(false);
  const mobileSidebarCloseTimer = useRef<number | null>(null);
  const activeItemId =
    sidebarGroups
      .flatMap((group) => group.items)
      .find((item) => item.route === activeRoute)?.id ?? "overview";
  const isMobileSidebarLayerVisible =
    isMobileSidebarOpen || isMobileSidebarClosing;

  useEffect(
    () => () => {
      if (mobileSidebarCloseTimer.current) {
        window.clearTimeout(mobileSidebarCloseTimer.current);
      }
    },
    [],
  );

  const openMobileSidebar = () => {
    if (mobileSidebarCloseTimer.current) {
      window.clearTimeout(mobileSidebarCloseTimer.current);
      mobileSidebarCloseTimer.current = null;
    }

    setIsMobileSidebarClosing(false);
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    if (!isMobileSidebarOpen) {
      return;
    }

    setIsMobileSidebarOpen(false);
    setIsMobileSidebarClosing(true);

    if (mobileSidebarCloseTimer.current) {
      window.clearTimeout(mobileSidebarCloseTimer.current);
    }

    mobileSidebarCloseTimer.current = window.setTimeout(() => {
      setIsMobileSidebarClosing(false);
      mobileSidebarCloseTimer.current = null;
    }, 500);
  };

  return (
    <main
      className={cn(
        "grid min-h-svh bg-background pt-[68px] text-foreground transition-[grid-template-columns] duration-300 ease-in-out max-[1180px]:grid-cols-1",
        isSidebarCollapsed
          ? "min-[1181px]:grid-cols-[88px_minmax(0,1fr)]"
          : "min-[1181px]:grid-cols-[260px_minmax(0,1fr)]",
      )}
    >
      <Button
        aria-expanded={isMobileSidebarOpen}
        aria-label="Open sidebar menu"
        className="fixed left-4 top-[78px] z-30 max-[1180px]:inline-flex min-[1181px]:hidden"
        onClick={() => {
          if (isMobileSidebarOpen) {
            closeMobileSidebar();
            return;
          }

          openMobileSidebar();
        }}
        size="icon"
        variant="outline"
      >
        <Menu aria-hidden="true" className="size-4" />
      </Button>

      {isMobileSidebarLayerVisible ? (
        <button
          aria-label="Close sidebar overlay"
          className={cn(
            "fixed inset-0 z-30 bg-background/70 backdrop-blur-sm transition-opacity duration-500 min-[1181px]:hidden",
            isMobileSidebarOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMobileSidebar}
          type="button"
        />
      ) : null}

      {isMobileSidebarLayerVisible ? (
        <Button
          aria-label="Close sidebar menu"
          className={cn(
            "fixed top-[92px] z-50 -translate-x-1/2 rounded-full bg-card shadow-md transition-[left,opacity] duration-500 ease-in-out max-[1180px]:inline-flex min-[1181px]:hidden",
            isMobileSidebarOpen
              ? "left-[min(290px,calc(100vw-1rem))] opacity-100"
              : "pointer-events-none left-0 opacity-0",
          )}
          onClick={closeMobileSidebar}
          size="icon-sm"
          variant="outline"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
      <aside
        className={cn(
          "fixed left-0 top-[68px] z-40 flex h-[calc(100dvh-68px)] w-[290px] -translate-x-full flex-col overflow-hidden border-r border-border bg-card p-4 transition-[padding,transform,width] duration-500 ease-in-out max-[1180px]:shadow-2xl min-[1181px]:sticky min-[1181px]:z-auto min-[1181px]:w-auto min-[1181px]:translate-x-0 min-[1181px]:overflow-visible min-[1181px]:shadow-none",
          isMobileSidebarOpen && "translate-x-0",
          isSidebarCollapsed && "min-[1181px]:items-center min-[1181px]:px-3",
        )}
      >
        <Button
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className="absolute -right-4 top-6 z-10 hidden rounded-full bg-card shadow-md min-[1181px]:inline-flex"
          onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
          size="icon-sm"
          variant="outline"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen aria-hidden="true" className="size-4" />
          ) : (
            <PanelLeftClose aria-hidden="true" className="size-4" />
          )}
        </Button>

        <Card
          className={cn(
            "bg-muted max-sm:hidden",
            isSidebarCollapsed && "min-[1181px]:hidden",
          )}
        >
          <CardContent className="flex items-center gap-3 p-3">
            <img
              alt="Auto CDO logo"
              className="size-12 rounded-lg object-cover"
              src="/cdocarlogo.png"
            />
            <div>
              <strong className="block text-sm">{profileName}</strong>
              <span className="mt-1 block text-xs font-bold text-muted-foreground">
                {profileSubtitle}
              </span>
            </div>
          </CardContent>
        </Card>

        <nav className="flex-1 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid gap-4">
            {sidebarGroups.map((group) => (
              <div className="grid gap-1" key={group.label}>
                <p
                  className={cn(
                    "px-3 text-xs font-black uppercase tracking-wider text-muted-foreground",
                    isSidebarCollapsed && "min-[1181px]:sr-only",
                  )}
                >
                  {group.label}
                </p>

                {group.items.map(({ icon: Icon, id, route, title }) => (
                  <button
                    aria-current={activeItemId === id ? "page" : undefined}
                    className={cn(
                      "group/navitem relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary",
                      isSidebarCollapsed &&
                        "min-[1181px]:justify-center min-[1181px]:px-0",
                      activeItemId === id && "bg-primary/10 text-primary",
                    )}
                    key={id}
                    onClick={() => {
                      onNavigate(route);
                      closeMobileSidebar();
                    }}
                    title={title}
                    type="button"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span
                      className={cn(
                        isSidebarCollapsed && "min-[1181px]:sr-only",
                      )}
                    >
                      {title}
                    </span>
                    {isSidebarCollapsed ? (
                      <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-xs font-black text-popover-foreground opacity-0 shadow-xl transition group-hover/navitem:block group-hover/navitem:opacity-100 min-[1181px]:block">
                        {title}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </nav>

        <Button
          className={cn(
            "group/logout relative mt-auto w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
            isSidebarCollapsed && "min-[1181px]:px-0",
          )}
          onClick={() => {
            closeMobileSidebar();
            onLogout();
          }}
          title="Logout"
          variant="outline"
        >
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
          <span className={cn(isSidebarCollapsed && "min-[1181px]:sr-only")}>
            Logout
          </span>
          {isSidebarCollapsed ? (
            <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-xs font-black text-popover-foreground opacity-0 shadow-xl transition group-hover/logout:block group-hover/logout:opacity-100 min-[1181px]:block">
              Logout
            </span>
          ) : null}
        </Button>
      </aside>

      <section className="flex min-w-0 flex-col gap-6 p-6 max-xl:p-4 max-sm:p-3 max-[1180px]:pt-16">
        <div className="min-w-0 flex-1">{children}</div>
        <footer className="border-t border-border py-4 text-sm font-semibold text-muted-foreground">
          <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
            <span className="inline-flex items-center gap-2 text-foreground">
              <Car aria-hidden="true" className="size-4 text-primary" />
              CDO Car Trading IMS
            </span>
            <span>Inventory, sales, reservations, and maintenance system.</span>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default AdminLayout;
