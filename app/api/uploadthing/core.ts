import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // 🎯 Existing: Course media uploads (Admin only)
  courseMedia: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 3 },
  })
    .middleware(async () => {
      const user = await currentUser();
      if (!user || user.publicMetadata?.role !== 'admin') {
        throw new Error("Unauthorized - Admin only");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Course media upload complete:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // 🎯 NEW: Squad image uploader (Any logged-in user)
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await currentUser();
      if (!user) {
        throw new Error("Unauthorized - Please sign in");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Squad image upload complete:", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;