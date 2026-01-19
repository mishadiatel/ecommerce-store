import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Detect file type from extension or MIME type from URL
export const getFileType = (url: string) =>  {
  const extension = url.split('.').pop()?.toLowerCase();
  if (!extension) return 'other';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

  if (imageExts.includes(extension)) return 'image';
  if (videoExts.includes(extension)) return 'video';
  return 'other';
}


export const generateFileUrl = (fileName: string) => {
  let fileUrl = fileName;
  if (!isValidUrl(fileName)) {
    fileUrl = `${process.env.NEXT_PUBLIC_PROJECT_API_URL}/files/${fileName}`;
  }

  return fileUrl;
}


export const cleanHtmlString = (html: string) => {
  if (!html) return '';
  return html
    .replace(/&nbsp;/g, ' ')
    .trim();
}