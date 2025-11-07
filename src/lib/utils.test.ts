import {
  formatRelativeTime,
  truncate,
  formatNumber,
  formatLargeNumber,
  isValidUrl,
  generateExcerpt,
} from "../src/lib/utils";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-11-07T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "just now" for very recent dates', () => {
    const now = Date.now();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("should format minutes correctly", () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    expect(formatRelativeTime(fiveMinutesAgo)).toBe("5m ago");
  });

  it("should format hours correctly", () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");
  });

  it("should format days correctly", () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
  });

  it("should format weeks correctly", () => {
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(twoWeeksAgo)).toBe("2w ago");
  });

  it("should format months correctly", () => {
    const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(twoMonthsAgo)).toBe("2mo ago");
  });

  it("should format years correctly", () => {
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(oneYearAgo)).toBe("1y ago");
  });
});

describe("truncate", () => {
  it("should truncate text longer than specified length", () => {
    const text = "This is a very long text that needs to be truncated";
    expect(truncate(text, 20)).toBe("This is a very long...");
  });

  it("should return original text if shorter than length", () => {
    const text = "Short text";
    expect(truncate(text, 20)).toBe("Short text");
  });

  it("should handle empty string", () => {
    expect(truncate("", 10)).toBe("");
  });
});

describe("formatNumber", () => {
  it("should format numbers with commas", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1000000)).toBe("1,000,000");
  });

  it("should handle small numbers", () => {
    expect(formatNumber(5)).toBe("5");
    expect(formatNumber(99)).toBe("99");
  });
});

describe("formatLargeNumber", () => {
  it("should format millions correctly", () => {
    expect(formatLargeNumber(1500000)).toBe("1.5M");
    expect(formatLargeNumber(2000000)).toBe("2.0M");
  });

  it("should format thousands correctly", () => {
    expect(formatLargeNumber(1500)).toBe("1.5K");
    expect(formatLargeNumber(5000)).toBe("5.0K");
  });

  it("should return original number for values less than 1000", () => {
    expect(formatLargeNumber(500)).toBe("500");
    expect(formatLargeNumber(99)).toBe("99");
  });
});

describe("isValidUrl", () => {
  it("should validate correct URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://example.com/path?query=1")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("example.com")).toBe(false);
  });
});

describe("generateExcerpt", () => {
  it("should remove HTML tags", () => {
    const html = "<p>This is <strong>bold</strong> text</p>";
    const excerpt = generateExcerpt(html, 50);
    expect(excerpt).not.toContain("<");
    expect(excerpt).not.toContain(">");
  });

  it("should truncate to maxLength", () => {
    const longText = "a".repeat(300);
    const excerpt = generateExcerpt(longText, 100);
    expect(excerpt.length).toBeLessThanOrEqual(103); // 100 + '...'
  });

  it("should handle empty content", () => {
    expect(generateExcerpt("", 100)).toBe("");
  });
});
