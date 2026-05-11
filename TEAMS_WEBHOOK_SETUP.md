# Teams Webhook Integration Setup Guide

## Problem
Teams notifications are not being triggered when:
- ✗ Creating/assigning a release
- ✗ Changing release status

## Root Cause
The webhook URLs are **not configured** in the Release Tool. They must be set up first before notifications will work.

---

## Solution: 3-Step Setup

### Step 1: Get Your Teams Webhook URLs from Power Automate

**For Trigger 1 (QA Assignment):**
1. Go to [Power Automate](https://make.powerautomate.com)
2. Open your "QA Internal" flow (or equivalent)
3. Find the **Teams POST connector** step
4. Copy the **Webhook URL** (in red box)
5. Save this URL

**For Trigger 2 (Status Updates):**
1. Open your "Blocker Tracker" flow (or equivalent)
2. Find the **Teams POST connector** step
3. Copy the **Webhook URL**
4. Save this URL

📌 **Important**: Each webhook URL looks like:
```
https://make.powerautomate.com/... 
or
https://logic.azure.com/...
```

---

### Step 2: Configure Webhooks in Release Tool

1. Open **Puffin_Release_Tool.html** in your browser
2. Click **Configuration (C)** tab in the left sidebar
3. Paste your webhook URLs in the input fields:
   - **Trigger 1 Webhook**: QA assignment notifications
   - **Trigger 2 Webhook**: Status change notifications
4. Click **Test Trigger 1** and **Test Trigger 2** to verify connectivity
5. ✅ If successful, you'll see a Teams message in your channel

---

### Step 3: How the Triggers Work

#### **Trigger 1: QA Assignment**
**When it fires:**
- When you add a new release with an Assignee field
- When you click "Add all rows" in Release Logger

**What it sends to Teams:**
- Release Number
- Client
- Assigned QA person

**Requirements:**
- Assignee field must have a value
- Webhook URL 1 must be configured
- ✅ Does NOT require QA Remarks

---

#### **Trigger 2: Status Change**
**When it fires:**
- When you change a release's Testing Status in Release Dashboard (Edit tab)
- When you update status in Release Logger (Review Card)

**What it sends to Teams:**
- Release Number
- Client
- Developer Name
- Assigned QA
- New Status (QA Passed/Failed/Pending/Rejected)
- QA Remarks/Notes

**Requirements:**
- Webhook URL 2 must be configured
- ⚠️ **NEW (Fixed)**: QA Remarks is now optional (was required before)

---

## Troubleshooting Checklist

### ❌ Webhooks Not Firing?

1. **Check Configuration Tab**
   - Open Settings (C) tab
   - Verify both webhook URLs are entered
   - Click "Test Trigger 1" and "Test Trigger 2"
   - Look for success/error messages

2. **Check Browser Console (F12 → Console)**
   - Look for errors like:
     - `"No webhook URL configured"`
     - `"HTTP 401/403"` → Wrong permissions
     - `"HTTP 404"` → Wrong URL
     - `Network error` → Connectivity issue

3. **Check Power Automate Logs**
   - Go to [Power Automate](https://make.powerautomate.com)
   - Open each flow → "28-day run history"
   - Look for recent runs
   - Check if incoming requests were received
   - If failed, check the error details

4. **Verify Webhook URL Format**
   - URLs should start with: `https://make.powerautomate.com` or `https://logic.azure.com`
   - Should be 100+ characters long
   - Should NOT have spaces or line breaks

5. **Check Teams Channel**
   - Are you looking at the right Teams channel?
   - Power Automate connector must be configured to post to the correct channel

### ⚠️ Teams Message Format Wrong?

- Check Adaptive Card builder in code
- Verify all required fields exist in Excel data:
  - For Trigger 1: `ReleaseNo`, `Client`, `Assignee`
  - For Trigger 2: `ReleaseNo`, `Client`, `Developer Name`, `Assignee`, `Testing status`, `QA Remarks`

### 🔄 Still Not Working?

1. Test in browser Developer Tools → Network tab:
   - Make a change that should trigger webhook
   - Look for POST request to `make.powerautomate.com` or `logic.azure.com`
   - Check HTTP status (should be 200 or 202)
   - If > 400, there's an error

2. Check if you have Teams/Power Automate access:
   - Try logging into Power Automate directly
   - Verify your flows are "Enabled"

3. Check Power Automate flow triggers:
   - Make sure flows are not in "Disabled" state
   - Verify incoming webhook trigger is set up (not scheduled)

---

## Quick Reference

| What | Where | Status |
|------|-------|--------|
| **Trigger 1 URL** | Configuration (C) tab → "Trigger 1 Webhook" | ← Configure here |
| **Trigger 2 URL** | Configuration (C) tab → "Trigger 2 Webhook" | ← Configure here |
| **Test Connection** | Click "Test Trigger 1" or "Test Trigger 2" buttons | Should show ✅ success |
| **View Logs** | "Notification Log" in Release Logger | Real-time notifications |
| **Power Automate** | [make.powerautomate.com](https://make.powerautomate.com) | Check run history |

---

## Next Steps

1. ✅ Get webhook URLs from Power Automate
2. ✅ Paste them in Configuration (C) tab
3. ✅ Click "Test" buttons to verify
4. ✅ Try creating/updating a release
5. 📝 Monitor Notification Log for status

**Questions?** Check the "Notification Log" in the Release Logger tab for real-time error messages.
