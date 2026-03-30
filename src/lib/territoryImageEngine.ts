/**
 * Territory Image Engine
 * Extracts territory images from ZIP/RAR archives and creates a lookup map
 * keyed by territory code (4-digit numeric string like "1202")
 */

import JSZip from "jszip";

const SUPPORTED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

interface ExtractedFile {
  name: string;
  data: Blob;
}

/**
 * Extract files from a ZIP archive using JSZip library
 * Supports flat structure and single-level deep subfolder
 */
async function extractZipFiles(file: File): Promise<ExtractedFile[]> {
  try {
    const zip = new JSZip();
    const arrayBuffer = await file.arrayBuffer();
    const loaded = await zip.loadAsync(arrayBuffer);

    const files: ExtractedFile[] = [];
    const promises: Promise<void>[] = [];

    loaded.forEach((relativePath: string, zipEntry: any) => {
      // Skip directories and files in nested folders deeper than 1 level
      if (zipEntry.dir) return;

      // Support both / and \ separators for path segments
      const normalizedPath = relativePath.replace(/\\/g, "/");
      const pathParts = normalizedPath.split("/").filter((p: string) => p);
      if (pathParts.length > 2) return; // Skip if more than 1 level deep

      const fileName = pathParts[pathParts.length - 1];

      promises.push(
        zipEntry.async("blob").then((data: Blob) => {
          files.push({ name: fileName, data });
        })
      );
    });

    await Promise.all(promises);
    return files;
  } catch (error) {
    console.error("JSZip error or file is not a valid ZIP:", error);
    throw new Error("Failed to extract ZIP file. Ensure it's a valid .zip archive.");
  }
}

/**
 * Extract files from a RAR archive
 * Note: Client-side RAR extraction is limited. This requires a library.
 */
async function extractRarFiles(file: File): Promise<ExtractedFile[]> {
  try {
    // For RAR files, we'd need a dedicated library like rarjs or server-side extraction
    // As a fallback, we'll throw an informative error
    throw new Error(
      "RAR extraction requires server-side support. Please use ZIP format or contact support."
    );
  } catch (error) {
    console.error("RAR extraction error:", error);
    throw error;
  }
}

/**
 * Parse territory code from filename (e.g., "1202.png" -> "1202")
 */
function extractTerritoryCode(filename: string): string | null {
  // Remove extension and get base name
  const baseName = filename.split(".").slice(0, -1).join(".");
  
  // Validate that it's a 4-digit numeric string
  if (/^\d{4}$/.test(baseName)) {
    return baseName;
  }
  
  return null;
}

/**
 * Check if a filename has a supported image extension (case-insensitive)
 */
function hasSupportedImageExtension(filename: string): boolean {
  const lowerName = filename.toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

/**
 * Build a territory code -> image blob/URL map from an archive file
 * Returns a Record<territoryCode, dataUrl>
 */
export async function processTerritoryImageArchive(
  archiveFile: File
): Promise<Record<string, string>> {
  const fileName = archiveFile.name.toLowerCase();
  let extractedFiles: ExtractedFile[] = [];
  
  try {
    if (fileName.endsWith(".zip")) {
      extractedFiles = await extractZipFiles(archiveFile);
    } else if (fileName.endsWith(".rar")) {
      extractedFiles = await extractRarFiles(archiveFile);
    } else {
      throw new Error("Unsupported archive format. Please use .zip or .rar");
    }
  } catch (error) {
    console.error("Archive extraction failed:", error);
    throw error;
  }
  
  const territoryImageMap: Record<string, string> = {};
  
  for (const file of extractedFiles) {
    // Only process image files
    if (!hasSupportedImageExtension(file.name)) {
      continue;
    }
    
    const territoryCode = extractTerritoryCode(file.name);
    if (!territoryCode) {
      console.warn(`Skipping file with invalid territory code: ${file.name}`);
      continue;
    }
    
    try {
      // Convert blob to data URL for storage/rendering
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsDataURL(file.data);
      });
      
      territoryImageMap[territoryCode] = dataUrl;
    } catch (error) {
      console.error(`Failed to process image for territory ${territoryCode}:`, error);
    }
  }
  
  if (Object.keys(territoryImageMap).length === 0) {
    console.warn("No valid territory images found in archive");
  }
  
  return territoryImageMap;
}

/**
 * Get the image URL/blob for a specific territory code
 * Returns the data URL if found, or undefined if not available
 */
export function getTerritoryImage(
  territoryCode: string,
  territoryImageMap: Record<string, string>
): string | undefined {
  return territoryImageMap[territoryCode];
}

/**
 * Merge territory images into TSO data
 * Updates TSO objects with territory images based on their territoryCode
 */
export function mergeTerritoryImagesToTSO(
  tsoData: any[],
  territoryImageMap: Record<string, string>
): void {
  for (const tso of tsoData) {
    if (tso.territory_code) {
      const imageUrl = getTerritoryImage(tso.territory_code, territoryImageMap);
      if (imageUrl) {
        tso.avatar = imageUrl;
      }
    }
  }
}
