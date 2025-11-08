import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArticleReaderClient } from "../components/article/ArticleReaderClient";
import { LoadingState } from "@/components/ui/LoadingState";

function ArticleReaderPageContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get("url");
  const [articleUrl, setArticleUrl] = useState<string | null>(null);

  useEffect(() => {
    if (urlParam) {
      setArticleUrl(decodeURIComponent(urlParam));
    } else if (typeof window !== "undefined") {
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
        navigate("/");
      }
    }
  }, [urlParam, navigate]);

  if (!articleUrl) {
    return <LoadingState message="Loading article..." fullScreen />;
  }

  return <ArticleReaderClient url={articleUrl} />;
}

export default function ArticlePage() {
  return (
    <Suspense
      fallback={<LoadingState message="Loading article..." fullScreen />}
    >
      <ArticleReaderPageContent />
    </Suspense>
  );
}

