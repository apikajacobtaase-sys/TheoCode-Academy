import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { ourFileRouter } from '@/app/api/uploadthing/core';

// 🎯 FIX: Use lowercase 'ourFileRouter' to match the import
export const UploadButton = generateUploadButton<typeof ourFileRouter>();
export const UploadDropzone = generateUploadDropzone<typeof ourFileRouter>();