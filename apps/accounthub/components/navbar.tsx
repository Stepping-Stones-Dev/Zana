import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import Router from "next/router";
// Defer loading of auth-related UI to a separate chunk
import dynamic from "next/dynamic";
import { ThemeSwitch } from "@zana/ui";
import { Logo } from "@zana/ui";
import { useTranslation } from "@zana/i18n";
import { useRouter } from "next/router";

const NavAuthStatus = dynamic(() => import("@zana/auth").then(m => m.NavAuthStatus), { ssr: false });

export const Navbar = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  
  // Check if current route should have auth context
  const path = router.pathname || "";
  const isPublicRoute =
    path === "/" ||
    path === "/pricing" ||
    path === "/features" ||
    path === "/privacy" ||
    path.startsWith("/auth") && path !== "/auth/account";

  // Proactively prefetch common routes when idle
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      ["/features", "/pricing", "/account", "/organizations"].forEach((p) => {
        try { Router.prefetch(p); } catch {}
      });
    }, 800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="top-0 z-50">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/" locale={locale as any}>
            <Logo />
            {/* <p className="font-bold text-inherit">{t("brand")}</p> */}
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        {/* Primary nav links after the ThemeSwitch (desktop) */}
        <div className="hidden lg:flex gap-6 items-center mr-4">
          <NavbarItem>
            <NextLink
              className={linkStyles({ color: "foreground" })}
              href="/features"
              locale={locale as any}
              onMouseEnter={() => {
                try {
                  if (typeof window !== 'undefined' && (Router as any)?.router) {
                    Router.prefetch('/features');
                  }
                } catch {}
              }}
            >
              {t("nav.features")}
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink
              className={linkStyles({ color: "foreground" })}
              href="/pricing"
              locale={locale as any}
              onMouseEnter={() => {
                try {
                  if (typeof window !== 'undefined' && (Router as any)?.router) {
                    Router.prefetch('/pricing');
                  }
                } catch {}
              }}
            >
              {t("nav.pricing")}
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink
              className={linkStyles({ color: "foreground" })}
              href="/account"
              locale={locale as any}
              onMouseEnter={() => {
                try {
                  if (typeof window !== 'undefined' && (Router as any)?.router) {
                    Router.prefetch('/account');
                  }
                } catch {}
              }}
            >
              Account
            </NextLink>
          </NavbarItem>
          <NavbarItem>
            <NextLink
              className={linkStyles({ color: "foreground" })}
              href="/organizations"
              locale={locale as any}
              onMouseEnter={() => {
                try {
                  if (typeof window !== 'undefined' && (Router as any)?.router) {
                    Router.prefetch('/organizations');
                  }
                } catch {}
              }}
            >
              Organizations
            </NextLink>
          </NavbarItem>
        </div>
        {/* Auth status - only show on private routes where AuthProvider is available */}
        {!isPublicRoute && <NavAuthStatus />}
      </NavbarContent>

      {/* Mobile menu toggle */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <NavbarMenuItem>
            <NextLink
              className={`${linkStyles({ color: "foreground" })} w-full`}
              href="/features"
              locale={locale as any}
            >
              {t("nav.features")}
            </NextLink>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <NextLink
              className={`${linkStyles({ color: "foreground" })} w-full`}
              href="/pricing"
              locale={locale as any}
            >
              {t("nav.pricing")}
            </NextLink>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <NextLink
              className={`${linkStyles({ color: "foreground" })} w-full`}
              href="/account"
              locale={locale as any}
            >
              Account
            </NextLink>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <NextLink
              className={`${linkStyles({ color: "foreground" })} w-full`}
              href="/organizations"
              locale={locale as any}
            >
              Organizations
            </NextLink>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};