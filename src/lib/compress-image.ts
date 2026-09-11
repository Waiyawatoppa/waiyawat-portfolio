/**
 * Client-side downscale and re-encode before upload.
 *
 * A phone photo is routinely 4-8 MB at 4000px; nothing on this site renders
 * wider than ~1200px. Resizing in the browser keeps storage small and uploads
 * fast without touching the server-side limits, which remain the backstop.
 *
 * Any failure returns the original file — this must never block an upload.
 */
export async function compressImage(
  file: File,
  { maxEdge = 2000, quality = 0.85 } = {},
): Promise<File> {
  try {
    if (!file.type.startsWith("image/")) return file;
    // GIF may be animated; re-encoding would flatten it.
    if (file.type === "image/gif") return file;
    if (typeof createImageBitmap !== "function") return file;

    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxEdge / longest);

    // Already small enough in both dimensions and bytes: leave it alone.
    if (scale === 1 && file.size < 800 * 1024) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // PNG keeps transparency; everything else re-encodes as WebP.
    const type = file.type === "image/png" ? "image/png" : "image/webp";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, quality),
    );
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    const extension = type === "image/png" ? "png" : "webp";
    return new File([blob], `${base}.${extension}`, { type });
  } catch {
    return file;
  }
}

/**
 * Replaces the files on a native <input type="file"> so a plain form submit
 * sends the compressed version. Not every browser allows assigning `files`;
 * if it refuses, the original upload proceeds unchanged.
 */
export async function compressFileInput(input: HTMLInputElement): Promise<void> {
  const file = input.files?.[0];
  if (!file) return;
  const compressed = await compressImage(file);
  if (compressed === file) return;
  try {
    const transfer = new DataTransfer();
    transfer.items.add(compressed);
    input.files = transfer.files;
  } catch {
    /* keep the original file */
  }
}
