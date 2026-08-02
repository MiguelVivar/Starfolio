import { describe, expect, it } from "vitest";
import { formatCount, formatDate, formatSize } from "../format";

describe("formatCount", () => {
  it("formats counts under 1,000 as plain string numbers", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1)).toBe("1");
    expect(formatCount(950)).toBe("950");
    expect(formatCount(999)).toBe("999");
  });

  it("formats thousands with 'k' suffix and trims trailing .0", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(12500)).toBe("12.5k");
    expect(formatCount(999900)).toBe("999.9k");
  });

  it("formats millions with 'M' suffix and trims trailing .0", () => {
    expect(formatCount(1_000_000)).toBe("1M");
    expect(formatCount(1_500_000)).toBe("1.5M");
    expect(formatCount(2_000_000)).toBe("2M");
    expect(formatCount(12_400_000)).toBe("12.4M");
  });
});

describe("formatSize", () => {
  it("formats size in KB for values under 1024 KB", () => {
    expect(formatSize(0)).toBe("0 KB");
    expect(formatSize(512)).toBe("512 KB");
    expect(formatSize(1023)).toBe("1023 KB");
  });

  it("formats size in MB for values between 1024 KB and 1048575 KB", () => {
    expect(formatSize(1024)).toBe("1 MB");
    expect(formatSize(1536)).toBe("1.5 MB");
    expect(formatSize(10240)).toBe("10 MB");
  });

  it("formats size in GB for values 1048576 KB and above", () => {
    expect(formatSize(1048576)).toBe("1 GB");
    expect(formatSize(2621440)).toBe("2.5 GB");
  });
});

describe("formatDate", () => {
  it("extracts the YYYY-MM-DD date portion from ISO string", () => {
    expect(formatDate("2026-07-28T12:34:56Z")).toBe("2026-07-28");
    expect(formatDate("2026-01-01T00:00:00.000Z")).toBe("2026-01-01");
    expect(formatDate("2025-12-31")).toBe("2025-12-31");
  });
});
