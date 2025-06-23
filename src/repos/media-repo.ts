import axios from 'axios';
import { Error } from '../models/openapi';
import { callRepo } from './repo-util';
import { generatePresignedUrl as generatePresignedUrlApi } from '../__generated__/linkedup-web-api-client';

type S3MediaInfo = {
  fileName: string;
  objectKey: string;
  getUrl: string;
  deleteUrl: string;
};
export const uploadMedia = async (file: File): Promise<S3MediaInfo | Error> => {
  const result = await callRepo(() =>
    generatePresignedUrlApi({ body: { contentType: file.type } }),
  );

  if (result && 'putUrl' in result) {
    await axios.put(result.putUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    return { ...result, fileName: file.name };
  } else {
    return result;
  }
};

export const deleteMedia = async (media: S3MediaInfo): Promise<void> => {
  await axios.delete(media.deleteUrl);
};
