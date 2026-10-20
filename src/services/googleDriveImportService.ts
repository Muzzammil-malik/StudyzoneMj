export interface DriveScanFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  parentFolderId: string;
  parentFolderName: string;
  relativePath: string;
}

export interface DriveScanFolder {
  id: string;
  name: string;
  parentFolderId: string | null;
  relativePath: string;
}

export interface DriveScanResult {
  success: true;
  rootFolder: { id: string; name: string };
  folders: DriveScanFolder[];
  files: DriveScanFile[];
  totalFiles: number;
  totalFolders: number;
}

interface DriveScanFailure {
  success: false;
  error: { code: string; message: string };
}

export function parseDriveFolderId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^[A-Za-z0-9_-]{10,200}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com') return null;

    const pathMatch = url.pathname.match(/\/folders\/([A-Za-z0-9_-]{10,200})(?:\/|$)/);
    const folderId = pathMatch?.[1] || (url.pathname.endsWith('/open') ? url.searchParams.get('id') : null);
    return folderId && /^[A-Za-z0-9_-]{10,200}$/.test(folderId) ? folderId : null;
  } catch {
    return null;
  }
}

export function parseDriveFileId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com') return null;

    const pathMatch = url.pathname.match(/(?:^|\/)(?:drive\/u\/\d+\/)?file\/d\/([A-Za-z0-9_-]{10,200})(?:\/|$)/);
    const fileId = pathMatch?.[1]
      || (url.pathname === '/open' || url.pathname === '/uc' ? url.searchParams.get('id') : null);
    return fileId && /^[A-Za-z0-9_-]{10,200}$/.test(fileId) ? fileId : null;
  } catch {
    return null;
  }
}

function isAppsScriptOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === 'script.google.com'
      || hostname === 'script.googleusercontent.com'
      || hostname.endsWith('.script.googleusercontent.com')
      || hostname.endsWith('-script.googleusercontent.com');
  } catch {
    return false;
  }
}

function isFrameDescendant(outerFrame: Window, candidate: MessageEventSource | null): candidate is Window {
  if (!candidate) return false;
  const pending: Window[] = [outerFrame];
  const visited = new Set<Window>();

  while (pending.length) {
    const current = pending.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    if (current === candidate) return true;

    try {
      for (let index = 0; index < current.frames.length; index += 1) {
        pending.push(current.frames[index]);
      }
    } catch {
      // Cross-origin frame collections remain enumerable in supported browsers.
    }
  }

  return false;
}

export function scanDriveFolder(
  scannerUrl: string,
  folderId: string,
  accessToken: string,
): Promise<DriveScanResult> {
  let endpoint: URL;
  try {
    endpoint = new URL(scannerUrl);
  } catch {
    return Promise.reject(new Error('Drive scanner URL is not configured correctly.'));
  }

  if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'script.google.com' || !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec\/?$/.test(endpoint.pathname)) {
    return Promise.reject(new Error('Configure VITE_DRIVE_SCANNER_URL with the deployed Apps Script web-app URL.'));
  }

  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const iframe = document.createElement('iframe');
    iframe.title = 'StudyZone Drive scanner';
    iframe.setAttribute('aria-hidden', 'true');
    // Keep in DOM viewport to avoid Chromium background/offscreen iframe execution throttling
    iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:10px;height:10px;opacity:0.001;pointer-events:none;border:0;z-index:-1;';
    iframe.src = endpoint.toString();

    let completed = false;
    let requestSentTo: Window | null = null;
    const finish = (callback: () => void) => {
      if (completed) return;
      completed = true;
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      iframe.remove();
      callback();
    };

    const timeout = window.setTimeout(() => {
      console.warn('[Drive scanner] response timeout', { requestId, scannerUrl: endpoint.toString() });
      finish(() => reject(Object.assign(new Error('Google Drive scanner did not respond. Check the Apps Script deployment.'), { code: 'SCANNER_TIMEOUT' })));
    }, 60_000);

    const onMessage = (event: MessageEvent) => {
      const outerFrame = iframe.contentWindow;
      if (!outerFrame) return;

      const isOriginAllowed = event.origin === 'null' || isAppsScriptOrigin(event.origin);
      if (!isOriginAllowed) {
        console.warn('[Drive scanner] ignored message from unexpected origin', { requestId, origin: event.origin });
        return;
      }

      const isSourceDescendant = isFrameDescendant(outerFrame, event.source);
      if (!isSourceDescendant) {
        console.info('[Drive scanner] message source verification fallback', {
          requestId,
          origin: event.origin,
          type: event.data?.type,
        });
      }

      if (event.data?.type === 'studyzone-drive-ready') {
        const bridgeFrame = (event.source as Window | null) || outerFrame;
        if (bridgeFrame === requestSentTo) return;
        requestSentTo = bridgeFrame;
        console.info('[Drive scanner] iframe ready message received', { requestId, origin: event.origin });
        console.info('[Drive scanner] scan request sent', { requestId, folderId });
        bridgeFrame.postMessage({ type: 'studyzone-drive-scan', requestId, folderId, accessToken }, event.origin === 'null' ? '*' : event.origin);
        return;
      }

      if (event.data?.type !== 'studyzone-drive-result' || event.data.requestId !== requestId) return;

      const result = event.data.result as DriveScanResult | DriveScanFailure | undefined;
      console.info('[Drive scanner] response received', {
        requestId,
        success: result?.success,
        totalFiles: result && 'totalFiles' in result ? result.totalFiles : undefined,
      });

      if (!result || typeof result.success !== 'boolean') {
        console.error('[Drive scanner] invalid response', { requestId, origin: event.origin });
        finish(() => reject(new Error('The Drive scanner returned an invalid response.')));
      } else if (result.success === true) {
        console.info('[Drive scanner] scan completed', { requestId, totalFiles: result.totalFiles, totalFolders: result.totalFolders });
        finish(() => resolve(result));
      } else {
        const failure = result as DriveScanFailure;
        console.warn('[Drive scanner] response error', { requestId, code: failure.error.code, message: failure.error.message });
        finish(() => reject(Object.assign(new Error(failure.error.message), { code: failure.error.code })));
      }
    };

    iframe.addEventListener('load', () => {
      requestSentTo = null;
      console.info('[Drive scanner] web-app iframe loaded', { requestId, scannerUrl: endpoint.toString() });
    });
    iframe.addEventListener('error', () => {
      console.error('[Drive scanner] web-app iframe failed to load', { requestId, scannerUrl: endpoint.toString() });
      finish(() => reject(Object.assign(new Error('Could not load the Apps Script web app. Check the deployment URL and access settings.'), { code: 'SCANNER_CONNECTION_FAILED' })));
    });
    window.addEventListener('message', onMessage);
    console.info('[Drive scanner] loading Apps Script web app', { requestId, scannerUrl: endpoint.toString() });
    document.body.appendChild(iframe);
  });
}