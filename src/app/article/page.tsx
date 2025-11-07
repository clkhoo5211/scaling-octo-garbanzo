"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArticleReaderClient } from "./ArticleReaderClient";
import { LoadingState } from "@/components/ui/LoadingState";

/**
 * Article Reader Page - Client-side routing for static export
 * Since GitHub Pages doesn't support dynamic routes, we use query params
 */
function ArticleReaderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url");
  const [articleUrl, setArticleUrl] = useState<string | null>(null);

  useEffect(() => {
    if (urlParam) {
      setArticleUrl(decodeURIComponent(urlParam));
    } else if (typeof window !== "undefined") {
      // Try to get URL from hash or pathname for backward compatibility
      const hash = window.location.hash.slice(1);
      const pathname = window.location.pathname;

      if (hash) {
        setArticleUrl(decodeURIComponent(hash));
      } else if (pathname.includes("/article/")) {
        const articlePath = pathname.split("/article/")[1];
        if (articlePath) {
          setArticleUrl(decodeURIComponent(articlePath));
        }
      } else {
        router.push("/");
      }
    }
  }, [urlParam, router]);

  if (!articleUrl) {
    return <LoadingState message="Loading article..." fullScreen />;
  }

  return <ArticleReaderClient url={articleUrl} />;
}

export default function ArticleReaderPage() {
  return (
    <Suspense
      fallback={<LoadingState message="Loading article..." fullScreen />}
    >
      <ArticleReaderPageContent />
    </Suspense>
  );
}
