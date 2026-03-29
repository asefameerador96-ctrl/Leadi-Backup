# Testing Guide: CSV Territory Code & Territory Image Engine

## Test 1: CSV Parser with Territory Code (New Format)

### Setup
1. Download CSV template from AdminPanel
2. The template now shows Territory Code as the first column:
   ```
   Territory Code,TSO Name,Territory,Division,Wing,...
   1202,Arif Khan,Dhaka East,Central,Modern Trade,...
   1203,Nusrat Jahan,Chattogram South,South,General Trade,...
   ```

### Test Case 1.1: Upload CSV with Territory Codes
1. Open AdminPanel
2. Click "Import TSO Data from CSV"
3. Upload a CSV with Territory Code in first column
4. **Expected:** 
   - CSV imports successfully
   - Each TSO now has `territory_code` set (e.g., "1202")
   - Console shows no errors

### Test Case 1.2: Backward Compatibility (Old CSV)
1. Use old CSV format (without Territory Code column)
2. Upload to AdminPanel
3. **Expected:**
   - CSV still imports perfectly
   - TSOs have `territory_code` as undefined/null
   - System works exactly as before

### Test Case 1.3: Territory Code in Different Column Position
1. Create CSV with Territory Code in the middle:
   ```
   TSO Name,Territory Code,Territory,Division,...
   Arif Khan,1202,Dhaka East,Central,...
   ```
2. Upload
3. **Expected:** 
   - Parser detects Territory Code regardless of position
   - Works correctly

---

## Test 2: Territory Image Archive Extraction

### Setup
1. Create a folder with 4-5 test images
2. Name them by territory code:
   - `1202.png`
   - `1203.jpg`
   - `1204.jpeg`
3. Create ZIP archive containing these files
4. Save as `territory_images.zip`

### Test Case 2.1: Flat Archive Structure
1. ZIP archive at root level with images:
   ```
   territory_images.zip
   ├── 1202.png
   ├── 1203.jpg
   ├── 1204.jpeg
   └── 1205.png
   ```
2. Upload to AdminPanel via "Territory Images" button
3. **Expected:**
   - Toast shows "Successfully extracted and applied 4 territory images..."
   - Each TSO with matching territory code now displays territory image
   - TopThreeCard shows territory image for top 3
   - Leaderboard rows show territory image as avatar

### Test Case 2.2: Single-Level Nested Structure
1. ZIP archive with images in subfolder:
   ```
   territory_images.zip
   └── images/
       ├── 1202.png
       ├── 1203.jpg
       ├── 1204.jpeg
       └── 1205.png
   ```
2. Upload
3. **Expected:**
   - Same result as flat structure
   - All images extracted and applied

### Test Case 2.3: Mixed Extensions (Case-Insensitive)
1. ZIP with various image formats:
   ```
   archive.zip
   ├── 1202.PNG       (uppercase)
   ├── 1203.jpg       (lowercase)
   ├── 1204.JPEG      (uppercase)
   └── 1205.Png       (mixed case)
   ```
2. Upload
3. **Expected:**
   - All extensions recognized (.PNG, .jpg, .JPEG, .Png)
   - All 4 images extracted and applied

### Test Case 2.4: Invalid Territory Codes Skipped
1. ZIP with mixed valid/invalid filenames:
   ```
   archive.zip
   ├── 1202.png       (valid: 4-digit)
   ├── 123.jpg        (invalid: 3-digit, skipped)
   ├── 12345.png      (invalid: 5-digit, skipped)
   ├── ABC1.jpeg      (invalid: non-numeric, skipped)
   └── 1203.png       (valid: 4-digit)
   ```
2. Upload
3. **Expected:**
   - Toast shows "Successfully extracted and applied 2 territory images..."
   - Only 1202 and 1203 TSOs get images
   - Invalid files logged to console with warnings but don't break process

### Test Case 2.5: Extra Files Ignored
1. ZIP with images and other files:
   ```
   archive.zip
   ├── 1202.png
   ├── 1203.jpg
   ├── readme.txt         (ignored)
   ├── metadata.json      (ignored)
   └── video.mp4          (ignored)
   ```
2. Upload
3. **Expected:**
   - Toast shows "Successfully extracted and applied 2 territory images..."
   - Non-image files silently ignored
   - No errors

---

## Test 3: Avatar Resolution & Fallback

### Setup
- Upload CSV with Territory Codes (e.g., 1202, 1203, 1204)
- Upload territory images for only some codes (e.g., 1202, 1203)
- Leave some TSOs without territory images

### Test Case 3.1: TSO with Territory Image
1. TSO with territory_code "1202" and image in archive
2. On leaderboard/top 3, check avatar
3. **Expected:**
   - Shows territory image (extracted from archive)
   - Image displays correctly

### Test Case 3.2: TSO without Territory Image (Fallback)
1. TSO with territory_code "1204" but NO image in archive
2. Check leaderboard
3. **Expected:**
   - Falls back to existing avatar (if any)
   - Or falls back to default placeholder
   - No error, graceful handling

### Test Case 3.3: TSO without Territory Code
1. Old TSO data without territory_code field
2. Check leaderboard
3. **Expected:**
   - Uses existing avatar URL
   - Territory image lookup skipped
   - Works exactly as before

---

## Test 4: Leaderboard Display Integration

### Test Case 4.1: Top 3 Cards Display Territory Images
1. Ensure top 3 TSOs have territory_codes and matching images in archive
2. Upload images
3. View leaderboard home page
4. **Expected:**
   - Top 3 cards show territory images in circular avatars
   - Images display correctly with appropriate borders (gold/silver/bronze)
   - Rank badges visible

### Test Case 4.2: Leaderboard Rows Display Territory Images
1. Scroll down to regular leaderboard rows
2. **Expected:**
   - Each row with territory_code and matching image shows territory image
   - 12x12px circular avatar with territory image
   - Rows animate in smoothly
   - Images load without errors

### Test Case 4.3: Responsive Display
1. View on mobile (narrow) screen
2. View on desktop (wide) screen
3. **Expected:**
   - Territory images display correctly on both
   - Avatars maintain aspect ratio
   - No layout shifts or errors

---

## Test 5: Error Handling

### Test Case 5.1: Invalid ZIP File
1. Upload non-ZIP file (e.g., text file)
2. **Expected:**
   - Toast error: "Failed to process territory images..."
   - Console shows helpful error
   - No crash, UI remains responsive

### Test Case 5.2: Corrupted ZIP
1. Create corrupted ZIP file (truncated or damaged)
2. Upload
3. **Expected:**
   - Toast error with descriptive message
   - System handles gracefully
   - Falls back to existing avatars

### Test Case 5.3: Empty Archive
1. Create empty ZIP file (no files)
2. Upload
3. **Expected:**
   - Toast warning: "No territory images found in archive"
   - No error, graceful warning
   - System continues working

### Test Case 5.4: Wrong File Format
1. Try uploading RAR file
2. **Expected:**
   - Toast error: "RAR extraction requires server-side support..."
   - Helpful message suggesting ZIP
   - No crash

---

## Test 6: Performance

### Test Case 6.1: Large Archive
1. Create ZIP with 100+ images
2. Upload
3. **Expected:**
   - Extraction completes within 2-3 seconds
   - No browser freeze
   - Toast confirms all images extracted

### Test Case 6.2: Large CSV + Images
1. Upload CSV with 500 TSOs
2. Then upload territory images
3. **Expected:**
   - Merging completes quickly
   - Leaderboard renders smoothly
   - No performance degradation

---

## Debugging Checklist

If tests fail, check:

1. **Console logs**
   - Check browser DevTools Console for error messages
   - Look for warnings about territory code validation

2. **JSZip library**
   - Verify jszip is installed: `npm list jszip`
   - If missing: `npm install jszip`

3. **Territory Code Format**
   - Ensure CSVs use 4-digit numeric territory codes
   - Check for extra spaces or special characters: `1202` (good), `1202 ` (bad)

4. **Image Filename Format**
   - Must be exactly 4 digits + extension: `1202.png` (good)
   - Not `c-1202.png`, not `region_1202.jpg`, etc.

5. **Archive Structure**
   - Images at root or in single subfolder only
   - Not deeply nested: `archive.zip/data/territories/images/1202.png` (fails)
   - But this works: `archive.zip/images/1202.png`

6. **Browser Storage**
   - Territory images stored as data URLs in TSO.avatar field
   - Check localStorage for size limits
   - Data URLs can be large for many images

7. **Backend Sync**
   - Verify backend API endpoint exists: `/api/admin/upload/tso-images`
   - Check backend logs for upload errors
   - Territory images should persist after page refresh

---

## Sample Test Data

### CSV Template
```csv
Territory Code,TSO Name,Territory,Division,Wing,Volume Size,Memo Size,Per Man Per Day Sales (PMPD),Sales per Memo,Outlet Reach,Volume Size (20) %,Memo Size (20) %,Per Man Per Day Sales (PMPD) (30) %,Sales per Memo (20) %,Outlet Reach (10) %,Overall %
1202,Md. Zihad Hossen,Mohamadpur,Dhanmondi,Dhaka,0.43230,2037,160,30,77,12.69,20.00,30.00,4.61,7.65,74.96
1203,Arifa Begum,Narayanganj,Central,Sales,0.52100,2150,175,35,82,13.50,21.50,32.00,5.20,8.25,78.45
1204,Maliha Khan,Tangail,Eastern,Distribution,0.38900,1950,148,28,71,11.80,19.50,28.50,4.10,7.10,71.20
1205,Karim Ahmed,Mymensingh,Northern,Support,0.61200,2250,190,42,88,14.25,22.50,35.00,6.30,8.80,82.35
```

### Creating Test Images
Use ImageMagick or online tools to create simple PNG/JPG files named by territory code.
Or find sample images online and rename them `1202.png`, `1203.jpg`, etc.

---

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Territory codes stored in TSO data
✅ Territory images extracted and displayed
✅ Fallback works for missing images
✅ Performance acceptable for large archives
✅ Backward compatibility maintained
✅ Error messages helpful and non-breaking
