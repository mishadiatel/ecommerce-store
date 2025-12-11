import { getFileType, isValidUrl } from '@/lib/utils';
import Image from 'next/image';

interface FilePreviewProps {
  fileUrl: string;
}

export default function FilePreview({ fileUrl }: FilePreviewProps) {

  if (!isValidUrl(fileUrl)) {
    return;
  }

  const fileType = getFileType(fileUrl);

  return (
    <>
      {fileType === 'image' && (
        <Image src={fileUrl} alt={''} width={48} height={48} className={'w-12 h-12 object-contain'} />
      )}

      {fileType === 'video' && (
        <video
          src={fileUrl}
          controls
          style={{ maxWidth: '300px', maxHeight: '200px' }}
        />
      )}
      {fileType === 'other' && (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Open file
        </a>
      )}
    </>
  );
}