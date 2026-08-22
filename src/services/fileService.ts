import { Resource } from '../types/resource';

export async function downloadResource(resource: Resource): Promise<void> {
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
