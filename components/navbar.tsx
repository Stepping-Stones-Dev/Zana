import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import { LoginButton } from "./LoginButton";


// SAML Login Button
function SamlLoginButton() {
  // Ensure the path is exactly "/api/auth/saml/login" (case-sensitive, no trailing slash)
  return (
    <Button
      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition"
      onClick={() => window.location.href = "/api/auth/saml/login"}
    >
      Login with Google Workspace SSO
    </Button>
  );
}

export const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [loginResult, setLoginResult] = useState<{ success: boolean; message: string } | null>(null);
  const [jwtUser, setJwtUser] = useState<{ email?: string; name?: string; picture?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setLoginResult({ success: true, message: "Login successful!" });
      }
    });
    return () => unsub();
  }, []);

  // Check for SAML JWT cookie
  useEffect(() => {
    const token = Cookies.get("token");
    // Prevent showing SAML login message on every reload
    const samlLoginShown = localStorage.getItem("samlLoginShown");
    if (token && !samlLoginShown) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setJwtUser({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        });
        setLoginResult({ success: true, message: "Booyah! You're logged in!" });
        localStorage.setItem("samlLoginShown", "true");
      } catch {
        setJwtUser(null);
      }
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setJwtUser({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        });
      } catch {
        setJwtUser(null);
      }
    }
  }, []);

  // Hide notification after 3 seconds
  useEffect(() => {
    if (loginResult) {
      const t = setTimeout(() => setLoginResult(null), 3000);
      return () => clearTimeout(t);
    }
  }, [loginResult]);

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">ACME</p>
          </NextLink>
        </NavbarBrand>
        {/* <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </div> */}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          {/* <Link isExternal href={siteConfig.links.twitter} title="Twitter">
            <TwitterIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.discord} title="Discord">
            <DiscordIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <GithubIcon className="text-default-500" />
          </Link> */}
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden sm:flex">
          {jwtUser ? (
            <span className="flex items-center gap-2 text-sm text-green-700 font-medium">
              {jwtUser.picture ? (
                <img
                  src={jwtUser.picture}
                  alt={jwtUser.name || jwtUser.email}
                  className="w-8 h-8 rounded-full border border-gray-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  {(jwtUser.name || jwtUser.email || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              )}
            </span>
          ) : (
            <SamlLoginButton />
          )}
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem className="hidden md:flex">
          {/* <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.sponsor}
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
          >
            Sponsor
          </Button> */}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        {/* <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link> */}
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        {/* <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div> */}
      </NavbarMenu>

      {/* Notification bar */}
      {loginResult && (
        <div
          className={`fixed left-0 right-0 top-[56px] z-50 transition-transform duration-300 ${
            loginResult.success
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          } px-4 py-0 text-center shadow-md`}
          style={{ transform: loginResult ? "translateY(0)" : "translateY(-100%)" }}
        >
          {loginResult.message}
        </div>
      )}
    </HeroUINavbar>
  );
};
