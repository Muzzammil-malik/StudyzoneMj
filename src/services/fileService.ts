import { Resource } from '../types/resource';

export async function downloadResource(resource: Resource): Promise<void> {
  const isDrive = resource.storageProvider === 'google_drive' || Boolean(resource.driveFileId) || (resource.fileUrl && resource.fileUrl.includes('drive.google.com'));

  if (isDrive) {
    const driveUrl = resource.driveViewUrl || (resource.driveFileId ? `https://drive.google.com/file/d/${encodeURIComponent(resource.driveFileId)}/view` : resource.fileUrl);
    window.open(driveUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const response = await fetch(resource.fileUrl);
  if (!response.ok) throw new Error('Unable to download this PDF.');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = resource.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
