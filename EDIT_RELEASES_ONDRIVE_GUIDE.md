# Edit Releases — Save to OneDrive Troubleshooting

## How Save to OneDrive Works

The **Edit Releases** (✏️) tab allows you to make changes to releases and save them directly back to your OneDrive Excel file.

### Prerequisites

1. **Excel file loaded from OneDrive** (not uploaded locally)
   - Go to **Release Logger** (📝) tab
   - Click **"Load from OneDrive"** button
   - Sign in and select your Excel file
   - File will be loaded and ready to edit

2. **OneDrive authentication active**
   - You must be signed in to OneDrive
   - Authentication token is stored in browser (expires after 1 hour)
   - If expired, click "Load from OneDrive" again to re-authenticate

3. **Release data in the table**
   - At least one release from Excel file is visible
   - If empty, load a file from OneDrive first

---

## Step-by-Step: Save to OneDrive

### 1. Make Changes
- Click on any cell in the Edit Releases table
- Edit the value (Release No, Status, Assignee, QA Remarks, etc.)
- Cell will highlight in **yellow** when changed
- ⚠️ **Unsaved Changes Banner** appears at the top

### 2. Save Individual Row
- Click the **"✓ Save"** button at the end of the changed row
- Row will highlight in **green**
- Status updates in memory

### 3. Sync to OneDrive
- Click **"Save to OneDrive"** button at the bottom
- Status message will show:
  - ⏳ "Uploading to OneDrive..." (in progress)
  - ✅ "Saved to OneDrive successfully!" (success)
  - ❌ "Error message..." (if failed)

### 4. Done
- File is now updated on OneDrive
- Unsaved changes banner disappears
- You can close the browser or navigate away

---

## Common Issues & Fixes

### ❌ "Not signed in to OneDrive"
**Cause**: No valid OneDrive authentication token  
**Fix**:
1. Go to **Release Logger** (📝) tab
2. Click **"Load from OneDrive"** button
3. Sign in with your FCC Kuwait account
4. Select your Excel file
5. Return to **Edit Releases** and try again

---

### ❌ "OneDrive file ID not found"
**Cause**: File was loaded locally instead of from OneDrive  
**Fix**:
1. Do NOT upload file locally
2. Always use "Load from OneDrive" button in Release Logger
3. Make sure you're loading from OneDrive, not downloading and re-uploading

---

### ❌ "No Excel file loaded"
**Cause**: WB (workbook object) is empty or not initialized  
**Fix**:
1. Go to **Release Logger** (📝) tab
2. Load an Excel file from OneDrive
3. You should see releases in the table
4. Return to **Edit Releases** tab
5. Try saving again

---

### ❌ "Network error" or "HTTP 401/403"
**Cause**: OneDrive authentication failed or token expired  
**Fix**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Reload the page (F5)
3. Go to Release Logger, click "Load from OneDrive" again
4. Sign in fresh
5. Try Edit Releases again

---

### ❌ "HTTP 404 — File not found on OneDrive"
**Cause**: File was deleted or moved on OneDrive  
**Fix**:
1. Verify file still exists on OneDrive (with same name)
2. Go to Release Logger, click "Load from OneDrive"
3. Select the file again
4. Return to Edit Releases and save

---

### ✏️ Row Updates in Memory but OneDrive Not Saved
**Cause**: Individual row saved (✓ Save button) but not synced to OneDrive yet  
**Fix**:
- Click the **"Save to OneDrive"** button at the bottom
- This uploads all changes to OneDrive

---

### 🔄 Save Stuck on "Uploading..."
**Cause**: Network error or OneDrive timeout  
**Fix**:
1. Wait 30 seconds
2. If still stuck, refresh page (F5)
3. Re-authenticate to OneDrive
4. Try saving again

---

## Workflow Example

```
1. Release Logger (📝) — Load from OneDrive
   ↓
   [Sign in] → [Select file] → [File loaded]
   ↓
2. Edit Releases (✏️) — Make Changes
   ↓
   [Edit cells] → [Row highlighted in yellow]
   ↓
3. Save Row
   ↓
   [Click ✓ Save] → [Row highlighted in green]
   ↓
4. Sync to OneDrive
   ↓
   [Click "Save to OneDrive"] → [⏳ Uploading...] → [✅ Saved!]
   ↓
5. Done
   ↓
   [OneDrive file updated] [Unsaved banner gone] [Ready for next changes]
```

---

## Verification

After saving to OneDrive, verify it worked:

1. **In the UI**: Look for "✅ Saved to OneDrive successfully!" message
2. **On OneDrive**: 
   - Open your Excel file in OneDrive/Office 365
   - Check Last Modified date changed to now
   - Verify your edits are there

3. **In Another Browser**:
   - Open another browser (or private window)
   - Go to OneDrive and download your file
   - Open it in Excel
   - Verify your changes persisted

---

## Browser DevTools Debugging (F12)

If save is failing, check the browser console:

1. Press **F12** to open DevTools
2. Click **Console** tab
3. Try saving again
4. Look for error messages
5. Common errors:
   - `No webhook URL configured` → Not a save error
   - `403 Forbidden` → Need to re-authenticate
   - `Network error` → Check internet connection
   - `Cannot read property 'split'` → File format issue

---

## Backup: Download Local

If OneDrive save is failing but you need to backup your changes:

1. Make your edits in **Edit Releases**
2. Click **"Download local"** button
3. File downloads to your computer as Excel
4. Try OneDrive save again later
5. You can manually upload the local file to OneDrive if needed

---

## Still Having Issues?

1. **Check your OneDrive**: Sign in at [onedrive.live.com](https://onedrive.live.com) and verify:
   - You can access your files
   - Your Excel file exists
   - You have Edit permission on the file

2. **Check your browser**: 
   - Clear cache (Ctrl+Shift+Delete)
   - Try a different browser
   - Try an incognito/private window

3. **Check your Excel file**:
   - Make sure it's a .xlsx file (not .xls or .csv)
   - File name matches what's configured (usually `release-details.xlsx`)
   - File is stored in OneDrive root or Documents folder

4. **Re-authenticate**:
   - Open Release Logger tab
   - Click "Load from OneDrive"
   - Sign out and sign in again
   - Return to Edit Releases

---

## Important Notes

⚠️ **Changes are saved in two stages:**
1. **Row-level save**: Click ✓ Save button → Changes saved to memory (local only)
2. **OneDrive sync**: Click "Save to OneDrive" → Changes uploaded to OneDrive

Make sure to do BOTH steps for changes to persist on OneDrive.

✅ **Session timeout**: OneDrive token expires after ~1 hour. If save fails with "401" error, re-authenticate.

✅ **File format**: Only .xlsx files are supported. Excel 2013+ format.

✅ **Concurrent edits**: Don't edit the same file in Excel Desktop and Browser at the same time.
