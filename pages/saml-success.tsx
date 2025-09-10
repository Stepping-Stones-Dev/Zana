import React, { useEffect } from "react";
import { useRouter } from "next/router";
import DefaultLayout from "@/layouts/default";

export default function SamlSuccess() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      router.replace("/");
    }
  }, [router]);

  return (
    <DefaultLayout>
      {/* Optionally, you can show a message while redirecting */}
      <div>
        <h1>Redirecting...</h1>
      </div>
    </DefaultLayout>
  );
}
