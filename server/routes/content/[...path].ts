import { createReadStream } from "fs";
import { existsSync } from "fs";
import { join } from "path";
import {
  defineEventHandler,
  getRouterParam,
  setResponseHeader,
  sendStream,
  createError,
} from "h3";

export default defineEventHandler((event) => {
  const path = getRouterParam(event, "path") || "";

  // For blog content, we need to specifically handle the structure
  // Try both the actual path and a nested index.md structure
  let fullPath = join(process.cwd(), "content", path);

  // Check if the path exists directly
  if (!existsSync(fullPath)) {
    // For common image patterns in blog posts
    if (path.startsWith("blog/") && path.includes(".")) {
      // Try to handle the common case of images in blog posts
      // e.g. /content/blog/2025/02/markdown-saves/image.jpg
      console.log(`[Content Assets] Looking for file: ${fullPath}`);

      // If file doesn't exist, check if it's in a subdirectory structure
      const pathParts = path.split("/");
      const filename = pathParts.pop() || "";

      if (pathParts.length > 0) {
        // Check if there's an index.md structure with images alongside
        const possibleDirPath = join(process.cwd(), "content", ...pathParts);
        const possibleFilePath = join(possibleDirPath, filename);

        console.log(
          `[Content Assets] Trying alternative path: ${possibleFilePath}`
        );

        if (existsSync(possibleFilePath)) {
          fullPath = possibleFilePath;
        } else {
          // Try one more pattern: look for a directory with same name as the last path segment
          const lastSegment = pathParts[pathParts.length - 1];
          const possibleNestedPath = join(
            possibleDirPath,
            lastSegment,
            filename
          );

          console.log(
            `[Content Assets] Trying nested path: ${possibleNestedPath}`
          );

          if (existsSync(possibleNestedPath)) {
            fullPath = possibleNestedPath;
          }
        }
      }
    }

    // If still not found after all attempts
    if (!existsSync(fullPath)) {
      console.error(`[Content Assets] File not found: ${fullPath}`);
      throw createError({
        statusCode: 404,
        statusMessage: `Asset not found: ${path}`,
      });
    }
  }

  // Set appropriate content type based on file extension
  const ext = fullPath.split(".").pop()?.toLowerCase();
  let contentType = "application/octet-stream";

  // Map common extensions to content types
  const contentTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    pdf: "application/pdf",
    mp4: "video/mp4",
    webm: "video/webm",
  };

  if (ext && contentTypes[ext]) {
    contentType = contentTypes[ext];
  }

  // Set response headers
  setResponseHeader(event, "Content-Type", contentType);
  console.log(`[Content Assets] Serving: ${fullPath} as ${contentType}`);

  // Send the file as a stream
  return sendStream(event, createReadStream(fullPath));
});
