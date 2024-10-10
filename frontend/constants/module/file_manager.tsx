import { Image as RNImage } from 'react-native';

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
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