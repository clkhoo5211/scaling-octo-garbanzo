"use client";

/**
 * TranslationButton Component
 * One-click translation button for articles
 * Shows translation status and allows toggling between original/translated
 */

import { useState, useEffect } from "react";
import { Languages, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { translateText, getUserLanguage, getLanguageName, type TranslationResult } from "@/lib/services/translationService";
import { useToast } from "@/components/ui/Toast";

interface TranslationButtonProps {
  text: string;
  articleUrl?: string;
  sourceLanguage?: string;
  className?: string;
  onTranslationComplete?: (result: TranslationResult) => void;
}

export function TranslationButton({
  text,
  articleUrl,
  sourceLanguage,
  className = "",
  onTranslationComplete,
}: TranslationButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(getUserLanguage());
  const { addToast } = useToast();

  // Check if translation is needed (source language differs from target)
  const needsTranslation = sourceLanguage && sourceLanguage !== targetLanguage;

  const handleTranslate = async () => {
    if (!text || text.trim().length === 0) {
      addToast({
        message: "No text to translate",
        type: "error",
      });
      return;
    }

    setIsTranslating(true);

    try {
      const result = await translateText(text, targetLanguage, sourceLanguage, articleUrl);

      if (result.success) {
        setTranslationResult(result);
        setShowTranslated(true);
        onTranslationComplete?.(result);

        const sourceLangName = result.detectedLanguage
          ? getLanguageName(result.detectedLanguage)
          : "Unknown";
        const targetLangName = getLanguageName(result.targetLanguage);

        addToast({
          message: `Translated from ${sourceLangName} to ${targetLangName}`,
          type: "success",
        });
      } else {
        addToast({
          message: result.error || "Translation failed",
          type: "error",
        });
      }
    } catch (error) {
      console.error("[TranslationButton] Translation error:", error);
      addToast({
        message: error instanceof Error ? error.message : "Translation failed",
        type: "error",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggle = () => {
    if (translationResult) {
      setShowTranslated(!showTranslated);
    }
  };

  // If already translated, show toggle button
  if (translationResult && translationResult.success) {
    return (
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
          showTranslated
            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        } ${className}`}
        title={showTranslated ? "Show original" : "Show translation"}
      >
        <Languages className="w-4 h-4" />
        <span>
          {showTranslated
            ? `Original (${translationResult.detectedLanguage ? getLanguageName(translationResult.detectedLanguage) : "Unknown"})`
            : `Translated (${getLanguageName(translationResult.targetLanguage)})`}
        </span>
      </button>
    );
  }

  // Show translate button if translation is needed or if user wants to translate anyway
  return (
    <button
      onClick={handleTranslate}
      disabled={isTranslating || !text || text.trim().length === 0}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
        needsTranslation
          ? "bg-blue-500 hover:bg-blue-600 text-white"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={
        needsTranslation
          ? `Translate to ${getLanguageName(targetLanguage)}`
          : "Translate article"
      }
    >
      {isTranslating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Translating...</span>
        </>
      ) : (
        <>
          <Languages className="w-4 h-4" />
          <span>
            {needsTranslation
              ? `Translate to ${getLanguageName(targetLanguage)}`
              : "Translate"}
          </span>
        </>
      )}
    </button>
  );
}

/**
 * TranslationDisplay Component
 * Displays translated text with toggle between original/translated
 */
interface TranslationDisplayProps {
  originalText: string;
  translationResult: TranslationResult | null;
  showTranslated: boolean;
  onToggle: () => void;
  className?: string;
}

export function TranslationDisplay({
  originalText,
  translationResult,
  showTranslated,
  onToggle,
  className = "",
}: TranslationDisplayProps) {
  if (!translationResult || !translationResult.success) {
    return <div className={className}>{originalText}</div>;
  }

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={onToggle}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
        >
          {showTranslated
            ? `Show Original (${translationResult.detectedLanguage ? getLanguageName(translationResult.detectedLanguage) : "Unknown"})`
            : `Show Translation (${getLanguageName(translationResult.targetLanguage)})`}
        </button>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        {showTranslated ? translationResult.translatedText : originalText}
      </div>
    </div>
  );
}

