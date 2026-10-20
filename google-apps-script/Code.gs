const MAX_PDFS = 500;
const MAX_FOLDERS = 2000;
const MAX_DEPTH = 30;

function doGet() {
  console.info('[StudyZone Drive Scanner] doGet reached');
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('StudyZone Drive Scanner')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function scanDriveFolder(folderId, accessToken) {
  console.info('[StudyZone Drive Scanner] scanDriveFolder reached', { folderId: folderId });
  try {
    authorizeAdmin_(accessToken);
    console.info('[StudyZone Drive Scanner] admin authorization passed');
    if (typeof folderId !== 'string' || !/^[A-Za-z0-9_-]{10,200}$/.test(folderId)) {
      return { success: false, error: { code: 'INVALID_FOLDER_ID', message: 'The folder ID is invalid.' } };
    }

    let root;
    try {
      root = DriveApp.getFolderById(folderId);
      root.getName();
    } catch (error) {
      console.warn('[StudyZone Drive Scanner] Drive folder access failed', { folderId: folderId });
      return { success: false, error: { code: 'FOLDER_UNAVAILABLE', message: 'The folder could not be found or accessed by the Apps Script owner.' } };
    }

    const rootFolder = { id: root.getId(), name: root.getName() };
    console.info('[StudyZone Drive Scanner] Drive folder access succeeded', { rootFolderName: rootFolder.name });
    const queue = [{ folder: root, path: root.getName(), parentFolderId: null, depth: 0 }];
    const folders = [];
    const files = [];

    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      folders.push({
        id: current.folder.getId(),
        name: current.folder.getName(),
        parentFolderId: current.parentFolderId,
        relativePath: current.path,
      });
      if (folders.length > MAX_FOLDERS) {
        return { success: false, error: { code: 'SCAN_LIMIT_EXCEEDED', message: 'This folder tree is too large to scan safely in one request.' } };
      }

      const fileIterator = current.folder.getFiles();
      while (fileIterator.hasNext()) {
        const file = fileIterator.next();
        const mimeType = file.getMimeType();
        const fileName = file.getName();
        if (mimeType !== MimeType.PDF && !fileName.toLowerCase().endsWith('.pdf')) continue;
        files.push({
          id: file.getId(),
          name: fileName,
          mimeType: mimeType,
          url: 'https://drive.google.com/file/d/' + encodeURIComponent(file.getId()) + '/view',
          parentFolderId: current.folder.getId(),
          parentFolderName: current.folder.getName(),
          relativePath: current.path + '/' + fileName,
        });
        if (files.length > MAX_PDFS) {
          return { success: false, error: { code: 'SCAN_LIMIT_EXCEEDED', message: 'More than 500 PDFs were found. Scan a smaller subject folder.' } };
        }
      }

      const folderIterator = current.folder.getFolders();
      while (folderIterator.hasNext()) {
        if (current.depth >= MAX_DEPTH) {
          return { success: false, error: { code: 'SCAN_LIMIT_EXCEEDED', message: 'The folder nesting is deeper than the supported limit.' } };
        }
        const child = folderIterator.next();
        queue.push({
          folder: child,
          path: current.path + '/' + child.getName(),
          parentFolderId: current.folder.getId(),
          depth: current.depth + 1,
        });
      }
    }

    console.info('[StudyZone Drive Scanner] Drive scan completed', { totalFiles: files.length, totalFolders: folders.length });
    return { success: true, rootFolder: rootFolder, folders: folders, files: files, totalFiles: files.length, totalFolders: folders.length };
  } catch (error) {
    if (error && error.code) {
      console.warn('[StudyZone Drive Scanner] scan rejected', { code: error.code, message: error.message });
      return { success: false, error: { code: error.code, message: error.message } };
    }
    console.error('[StudyZone Drive Scanner] unexpected scan failure', { message: error ? error.message : 'Unknown error' });
    return { success: false, error: { code: 'SCANNER_ERROR', message: 'The Drive scan could not be completed.' } };
  }
}

function authorizeAdmin_(accessToken) {
  console.info('[StudyZone Drive Scanner] admin authorization check reached');
  if (typeof accessToken !== 'string' || accessToken.length < 20 || accessToken.length > 8192) {
    throw scannerError_('UNAUTHENTICATED', 'Sign in to StudyZone as an administrator to scan Drive folders.');
  }

  const properties = PropertiesService.getScriptProperties();
  const supabaseUrl = (
    properties.getProperty('SUPABASE_URL') ||
    properties.getProperty('VITE_SUPABASE_URL') ||
    ''
  ).replace(/\/$/, '');
  const publishableKey =
    properties.getProperty('SUPABASE_PUBLISHABLE_KEY') ||
    properties.getProperty('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    '';

  if (!supabaseUrl || !publishableKey) {
    throw scannerError_('SCANNER_NOT_CONFIGURED', 'The Apps Script Supabase settings are missing.');
  }

  const headers = {
    apikey: publishableKey,
    Authorization: 'Bearer ' + accessToken,
    Accept: 'application/json',
  };

  const authResponse = UrlFetchApp.fetch(supabaseUrl + '/auth/v1/user', {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true,
  });
  console.info('[StudyZone Drive Scanner] Supabase Auth response', { status: authResponse.getResponseCode() });
  if (authResponse.getResponseCode() !== 200) {
    throw scannerError_('UNAUTHENTICATED', 'Your StudyZone session is invalid or expired. Sign in again.');
  }

  const user = JSON.parse(authResponse.getContentText());
  const profileUrl = supabaseUrl + '/rest/v1/profiles?id=eq.' + encodeURIComponent(user.id) + '&select=role';
  const profileResponse = UrlFetchApp.fetch(profileUrl, {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true,
  });
  console.info('[StudyZone Drive Scanner] profile response', { status: profileResponse.getResponseCode() });
  if (profileResponse.getResponseCode() !== 200) {
    throw scannerError_('AUTHORIZATION_CHECK_FAILED', 'StudyZone could not verify your administrator role.');
  }

  const profiles = JSON.parse(profileResponse.getContentText());
  if (!Array.isArray(profiles) || !profiles.some(function (profile) { return profile.role === 'admin'; })) {
    throw scannerError_('FORBIDDEN', 'Only StudyZone administrators can scan Drive folders.');
  }
}

function scannerError_(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
