import React from 'react';
import { useParams } from 'react-router-dom';
import { useResource } from '../hooks/useResource';
import { PdfViewer } from '../components/pdf/PdfViewer';
import { ErrorState } from '../components/ui/ErrorState';

export const ResourcePage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const {
    resource,
    subject,
    folder,
    folderHierarchy,
    isLoading,
    error,
    refetch,
  } = useResource(resourceId);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading academic PDF document...
        </p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Document Not Found"
          message={error || "We couldn't load this academic PDF resource."}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <PdfViewer
      resource={resource}
      subject={subject}
      folder={folder}
      folderHierarchy={folderHierarchy}
    />
  );
};
