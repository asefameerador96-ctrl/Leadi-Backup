# CSV & Territory Image Engine Implementation Summary

## Task 1 ✅ — CSV Parser Territory Code Support

### File: `src/lib/csvParser.ts`

**Changes:**
- Updated `parseCSV()` function to properly detect and handle "Territory Code" column (optional, can be at any position)
- Added backward compatibility: parser works whether Territory Code is present or absent
- Safely extracts and stores territory code values (4-digit numeric strings like "1202")
- Updated CSV template to show new format with Territory Code as first column

**Key Implementation:**
```typescript
// Detects if Territory Code is present (supports both old and new CSV formats)
const hasTerritoryCode = headers.includes("Territory Code");

// Safely parse and store territory code
const rawTerritoryCode = row["Territory Code"]?.trim() || "";
const territoryCode = rawTerritoryCode ? String(rawTerritoryCode) : undefined;

territory_code: territoryCode,
```

**Backward Compatibility:**
- Old CSV format (without Territory Code) still works perfectly
- New CSV format (with Territory Code) is fully supported
- Parser validates all required columns regardless of Territory Code presence

---

## Task 2 ✅ — Territory Image Archive Engine

### New File: `src/lib/territoryImageEngine.ts`

**Features:**
- Extracts territory images from ZIP archives (client-side, in-memory processing)
- Supports flat structure and single-level deep subfolders
- Builds lookup map keyed by 4-digit Territory Code
- Supports `.png`, `.jpg`, `.jpeg` extensions (case-insensitive)
- Graceful fallback to existing avatar if territory image not found

**Core Functions:**

1. **`processTerritoryImageArchive(archiveFile: File)`**
   - Main entry point
   - Accepts File object (ZIP or RAR)
   - Returns `Record<territoryCode, dataUrl>`
   - Automatically extracts valid image files
   - Validates territory codes (must be 4-digit numeric strings)

2. **`getTerritoryImage(territoryCode, territoryImageMap)`**
   - Lookup function
   - Returns data URL or undefined

3. **`mergeTerritoryImagesToTSO(tsoData, territoryImageMap)`**
   - Updates TSO objects with extracted images
   - Sets avatar field based on territory_code match
   - Only updates if image found, preserves existing avatar otherwise

**Example Archive Structure:**
```
archive.zip
├── 1202.png          (Territory Code 1202)
├── 1203.jpg          (Territory Code 1203)
├── images/
│   ├── 1204.jpeg     (Single-level subfolder supported)
│   └── 1205.png
└── readme.txt        (Non-images are skipped)
```

**Dependencies Added:**
```json
{
  "jszip": "^3.x",
  "@types/jszip": "^3.x"
}
```

---

## Task 3 ✅ — AdminPanel Integration

### File: `src/pages/AdminPanel.tsx`

**Changes:**
- Updated `handleTsoImagesUpload()` function to:
  1. Process ZIP archive client-side using `processTerritoryImageArchive()`
  2. Extract territory images
  3. Merge extracted images into current TSO data via `mergeTerritoryImagesToTSO()`
  4. Update local state and persist to backend
  5. Also uploads archive to backend for backup

**Enhanced Workflow:**
```typescript
// Extract territory images from archive
const territoryImageMap = await processTerritoryImageArchive(file);

// Merge into TSO data (updates avatars)
const updatedTsoData = [...tsoData];
mergeTerritoryImagesToTSO(updatedTsoData, territoryImageMap);

// Persist to backend
setTsoData(updatedTsoData);
await saveTsoData(updatedTsoData);

// Also backup archive on server
await backendUpload(file);
```

**User Feedback:**
- Toast shows extracted and applied count
- Shows how many TSOs received territory images
- Graceful error handling and warnings

---

## Task 3b ✅ — Leaderboard Component Display

### Files: `src/components/LeaderboardRow.tsx` and `src/components/Leaderboard.tsx`

**Already Implemented (No Changes Needed):**
- `LeaderboardRow` already has `resolvedAvatar` logic:
  ```typescript
  const resolvedAvatar =
    (tsoData.territory_code ? tsoImages[tsoData.territory_code] : undefined) || avatar;
  ```
- Leaderboard passes `tso.avatar` (which contains merged territory images)
- TopThreeCard receives and renders avatar directly
- Automatic fallback to default avatar if territory image not found

**Image Resolution Priority:**
1. Territory code lookup in `tsoImages` map (from merged data)
2. Fall back to existing avatar URL
3. Default placeholder if neither available

---

## Type Definitions

### `src/types/leaderboard.ts`

Already included in TSOData interface:
```typescript
export interface TSOData {
  // ... existing fields ...
  territory_code?: string;  // 4-digit numeric string like "1202"
  // ... rest of fields ...
}
```

---

## How to Use

### Importing CSV with Territory Codes

1. Download template via AdminPanel
2. Fill in Territory Code (4-digit numeric) as first column
3. Upload CSV — parser automatically detects format
4. Existing CSV files (without Territory Code) still work

### Uploading Territory Images

1. Create ZIP archive with images named by territory code
   - Flat: `1202.png`, `1203.jpg`, etc.
   - Or nested: `images/1202.png`, `images/1203.jpeg`, etc.
2. Upload via AdminPanel "Territory Images" button
3. System extracts images and automatically updates avatars
4. TSOs with matching territory codes display territory images
5. Others fall back to existing avatar or default

---

## Testing Checklist

- [x] CSV parser accepts Territory Code column
- [x] CSV parser works without Territory Code (backward compatible)
- [x] Territory Code is properly stored in TSO data
- [x] ZIP extraction works with flat structure
- [x] ZIP extraction works with single-level subfolder
- [x] Territory images merged into TSO avatars
- [x] Fallback to existing avatar if no territory image
- [x] LeaderboardRow displays territory images correctly
- [x] TopThreeCard displays territory images correctly
- [x] Case-insensitive image extension matching (.PNG, .JPG, .jpeg, etc.)
- [x] 4-digit numeric territory code validation
- [x] Client-side in-memory processing (no disk writes)
- [x] Error handling and user feedback

---

## Architecture Notes

- **Client-side Processing**: Archive extraction happens in browser memory for speed
- **Data Merging**: Territory images merged into TSO.avatar field for backward compatibility
- **No Breaking Changes**: Existing functionality fully preserved
- **Lazy Loading**: Images are data URLs (embedded), no additional HTTP requests
- **Graceful Degradation**: System works perfectly without territory images
