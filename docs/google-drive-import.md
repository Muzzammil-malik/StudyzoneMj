# Google Drive Import Scanner

This milestone scans Drive folder metadata and previews proposed StudyZone matches. It does not write to `resources`, upload PDF bytes, change Drive sharing, or modify Supabase Storage. The existing Storage upload flow remains available.

## Create the Apps Script project

1. Sign in at [script.google.com](https://script.google.com) with the Google account that owns the PDFs or has read access to the subject folders.
2. Create a standalone Apps Script project.
3. Replace `Code.gs` with [`google-apps-script/Code.gs`](../google-apps-script/Code.gs).
4. Add an HTML file named `Index` and use [`google-apps-script/Index.html`](../google-apps-script/Index.html).
5. In **Project Settings → Script Properties**, add:
   - `SUPABASE_URL`: the StudyZone project URL, for example `https://your-project.supabase.co`.
   - `SUPABASE_PUBLISHABLE_KEY`: the project's publishable key. Do not use a service-role or secret key.

The script runs as its deploying Google account so it can read that account's Drive files. It requests metadata only. It never changes sharing permissions or reads file contents.

## Deploy the web app

1. Select **Deploy → New deployment → Web app**.
2. Set **Execute as** to the deploying account.
3. Set access to **Anyone** so the browser can load the Apps Script HTML bridge without a Google sign-in redirect. The scanner is not authorized by this setting: each scan must also present a valid StudyZone session whose `profiles.role` is `admin`.
4. Deploy, authorize Drive read access when prompted, and copy the URL ending in `/exec`.
5. Set `VITE_DRIVE_SCANNER_URL` in the local ignored `.env` to that deployment URL, then restart Vite. The URL is configuration, not a secret.

The HTML bridge uses `google.script.run` inside an iframe because Apps Script does not provide arbitrary CORS response headers. Apps Script wraps its HTML output in a nested frame, so the bridge posts directly between the nested scanner frame and the top-level StudyZone window. There is no direct browser `doPost` transport.

## Security model

- The frontend sends the current StudyZone access token to the configured HTTPS Apps Script URL. It does not contain a Google credential or a reusable shared scanner secret.
- Apps Script validates the token through Supabase Auth, then checks that the matching profile has `role = 'admin'` before opening Drive.
- The script properties contain only the Supabase URL and publishable key. Never add a service-role key, Google OAuth secret, or refresh token.
- Anyone can load the deployed bridge, but only a current StudyZone administrator can invoke a scan. Keep the deployment URL configured only in the intended StudyZone environment and redeploy if access settings change.

## Test locally

1. Create a harmless Drive test folder with nested folders and a few test PDFs. Ensure the deploying Google account can view it.
2. Deploy the latest Apps Script version and set `VITE_DRIVE_SCANNER_URL` locally.
3. Sign in to StudyZone as an administrator and open **Admin → Resources → Import from Google Drive**.
4. Paste a folder URL such as `https://drive.google.com/drive/folders/FOLDER_ID`, then select **Scan Folder**.
5. Check the root name, PDF filenames, Drive IDs, relative paths, and proposed subject/category/folder matches. Unmatched values can be selected manually.

The scanner caps a single scan at 500 PDFs, 2,000 folders, and 30 folder levels. It returns a successful empty result when no PDFs are found. Drive errors do not alter sharing settings.

## Current limitations

- A deployed Apps Script URL and an accessible test Drive folder are required for an end-to-end scan. Neither is committed here.
- The UI is preview-only. **Import Selected** remains disabled because the current `resources` schema requires `file_path`, and the frontend always resolves PDFs through Supabase Storage. There is no `drive_file_id` field yet. Writing Drive rows now would create resources that the existing viewer cannot resolve.
- Duplicate detection and actual metadata insertion are deferred until Drive-backed resources are designed. Drive-backed resources use `https://drive.google.com/file/d/{id}/preview` in a full-size cross-origin iframe, without toolbar-suppression parameters or a StudyZone navigation overlay. The iframe displays only the controls Google chooses to expose for its preview; there is no documented, supported URL parameter in this integration to force its native thumbnail pane or zoom controls on. StudyZone cannot inspect that viewer, retrieve thumbnails, determine the current page, or control its navigation. Users can use Google preview controls when available or open the file in Google Drive. Supabase Storage resources continue to use the PDF.js viewer with page thumbnails and in-app page navigation.
- The folder scanner does not alter Drive permissions. The deploying account needs read access; viewers may separately need permission to open a discovered Drive URL.
- The Apps Script endpoint has not been deployed or tested against a real Drive folder from this workspace.
- After changing `Code.gs` or `Index.html`, manually update the existing deployment using **Deploy → Manage deployments → Edit → New version → Deploy**. The running endpoint does not automatically use edited source.