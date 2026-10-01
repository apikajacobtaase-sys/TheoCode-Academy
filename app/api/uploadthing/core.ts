import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  courseMaterial: f({
    image: { maxFileSize: "16MB" },
    video: { maxFileSize: "128MB" },
    pdf: { maxFileSize: "16MB" },
    text: { maxFileSize: "4MB" },
  })
    .middleware(() => {
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ UploadThing webhook SUCCESS!");
      console.log("📁 File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
};