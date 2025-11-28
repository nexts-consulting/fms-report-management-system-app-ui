import { nanoid } from "nanoid";

export const ImageUtil = {
  getBase64: (file: File) => {
    return URL.createObjectURL(file);
  },
  base64ToFile: (base64Image: any): File | null => {
    try {
      const arr = base64Image?.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);

      if (!mimeMatch) {
        return null;
      }

      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], nanoid(), { type: mime });
    } catch (error) {
      return null;
    }
  },
};
