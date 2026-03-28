import { describe, expect, it } from "vitest";
import { buildOutputName, sanitizeFilename } from "../src/lib/utils/filenames";

describe("sanitizeFilename", () => {
  it("returns valid filenames unchanged", () => {
    expect(sanitizeFilename("image")).toBe("image");
    expect(sanitizeFilename("my-image.png")).toBe("my-image.png");
    expect(sanitizeFilename("photo_123")).toBe("photo_123");
  });

  it("trims whitespace", () => {
    expect(sanitizeFilename("  image  ")).toBe("image");
    expect(sanitizeFilename("\tname\n")).toBe("name");
  });

  it("collapses multiple whitespace to single space", () => {
    expect(sanitizeFilename("my   image")).toBe("my image");
    expect(sanitizeFilename("a    b    c")).toBe("a b c");
  });

  it("removes leading and trailing dots", () => {
    expect(sanitizeFilename(".image")).toBe("image");
    expect(sanitizeFilename("image.")).toBe("image");
    expect(sanitizeFilename("..image..")).toBe("image");
  });

  it("removes leading and trailing whitespace combined with dots", () => {
    expect(sanitizeFilename("  .image.  ")).toBe("image");
  });

  it("replaces reserved filename characters", () => {
    expect(sanitizeFilename("image<name>")).toBe("image-name-");
    expect(sanitizeFilename("image:name")).toBe("image-name");
    expect(sanitizeFilename('image"file')).toBe("image-file");
    expect(sanitizeFilename("image/file")).toBe("image-file");
    expect(sanitizeFilename("image\\file")).toBe("image-file");
    expect(sanitizeFilename("image|file")).toBe("image-file");
    expect(sanitizeFilename("image?file")).toBe("image-file");
    expect(sanitizeFilename("image*file")).toBe("image-file");
  });

  it("replaces control characters (ASCII < 32)", () => {
    expect(sanitizeFilename("image\x00file")).toBe("image-file");
    expect(sanitizeFilename("image\x1ffile")).toBe("image-file");
  });

  it("returns fallback for empty/whitespace-only input", () => {
    expect(sanitizeFilename("")).toBe("image");
    expect(sanitizeFilename("   ")).toBe("image");
    expect(sanitizeFilename("...")).toBe("image");
  });

  it("uses custom fallback when provided", () => {
    expect(sanitizeFilename("", "photo")).toBe("photo");
    expect(sanitizeFilename("   ", "photo")).toBe("photo");
  });
});

describe("buildOutputName", () => {
  it("combines original name with new extension", () => {
    expect(buildOutputName("photo.jpg", "png")).toBe("photo.png");
    expect(buildOutputName("my-image.jpeg", "webp")).toBe("my-image.webp");
  });

  it("removes original extension", () => {
    expect(buildOutputName("image.png", "jpeg")).toBe("image.jpeg");
    expect(buildOutputName("photo.test.png", "avif")).toBe("photo.test.avif");
  });

  it("lowercases the extension", () => {
    expect(buildOutputName("image", "PNG")).toBe("image.png");
    expect(buildOutputName("image", "JPEG")).toBe("image.jpeg");
  });

  it("sanitizes the base name", () => {
    expect(buildOutputName("my<file>", "png")).toBe("my-file-.png");
    expect(buildOutputName("  photo  ", "webp")).toBe("photo.webp");
  });

  it("falls back to 'image' for invalid base names", () => {
    expect(buildOutputName("...", "png")).toBe("image.png");
    expect(buildOutputName("", "png")).toBe("image.png");
  });

  it("falls back to 'jpg' for invalid extensions", () => {
    expect(buildOutputName("photo", "")).toBe("photo.jpg");
    expect(buildOutputName("photo", "...")).toBe("photo.jpg");
  });

  it("handles extension with leading dot", () => {
    expect(buildOutputName("photo", ".png")).toBe("photo.png");
  });
});
