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
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { useTranslation } from "@/providers/I18nProvider";

const NavAuthStatus = dynamic(() => import("./NavAuthStatus"), { ssr: false });

export const Navbar = () => {
  const { t, locale } = useTranslation();

  // Proactively prefetch common routes when idle
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      ["/landing/features", "/landing/pricing", "/landing/contact", "/dashboard"].forEach((p) => {
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
            <p className="font-bold text-inherit">{t("brand")}</p>
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
              href="/landing/features"
              locale={locale as any}
              onMouseEnter={() => {
                try {
                  if (typeof window !== 'undefined' && (Router as any)?.router) {
                    Router.prefetch('/landing/features');
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
              href="/landing/pricing"
              locale={locale as any}
              onMouseEnter={() => {
                try {
                  if (typeof window !== 'undefined' && (Router as any)?.router) {
                    Router.prefetch('/landing/pricing');
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
              href="/landing/contact"
              locale={locale as any}
              onMouseEnter={() => {
                try {
                  if (typeof window !== 'undefined' && (Router as any)?.router) {
                    Router.prefetch('/landing/contact');
                  }
                } catch {}
              }}
            >
        {t("nav.contact")}
            </NextLink>
          </NavbarItem>
        </div>
        {/* Search input removed */}
        <NavbarItem className="hidden md:flex">
          <NavAuthStatus />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2 items-end text-right">
          <NavbarMenuItem>
            <NextLink href="/landing/features" locale={locale as any}>{t("nav.features")}</NextLink>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <NextLink href="/landing/pricing" locale={locale as any}>{t("nav.pricing")}</NextLink>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <NextLink href="/landing/contact" locale={locale as any}>{t("nav.contact")}</NextLink>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
  {/* Auth status notifications are handled inside NavAuthStatus */}
    </HeroUINavbar>
  );
};
