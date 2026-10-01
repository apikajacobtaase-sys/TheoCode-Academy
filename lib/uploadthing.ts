import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { ourFileRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();