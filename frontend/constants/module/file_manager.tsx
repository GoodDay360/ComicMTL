import { Image as RNImage } from 'react-native';

export const blobToBase64 = (blob: Blob, mimetype: string = ""): Promise<string> => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          if (mimetype){
            const base64WithMimeType = `data:${mimetype};base64,${base64String.split(',')[1]}`;
            resolve(base64WithMimeType);
          }else resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
  });
};

export const base64ToBlob = (base64: string, mimetype: string = 'image/png'): Blob => {
  const byteCharacters = Buffer.from(base64, 'base64');
  return new Blob([byteCharacters], { type: mimetype });
};

export const getImageLayout = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    RNImage.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};