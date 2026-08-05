import * as FileType from "file-type";
import { promises as fs } from "fs";
import { ApiError } from "./apiError";

interface ValidateFileOptions {
  allowedMimeTypes: string[];
  maxSizeInMB?: number;
}

export interface FilesValidationOptions {
  thumbnail?: ValidateFileOptions;
  images?: ValidateFileOptions;
}

export async function validateUploadedFile(
  buffer: Buffer,
  options: ValidateFileOptions,
  fieldName: string,
) {
  if (!buffer) {
    throw new ApiError(`الملف ${fieldName} غير موجود`, 404);
  }

  const maxSizeInBytes = (options.maxSizeInMB ?? 5) * 1024 * 1024;
  if (buffer.length > maxSizeInBytes) {
    throw new ApiError(
      `حجم الملف ${fieldName} كبير، الحد الأقصى ${options.maxSizeInMB ?? 5}MB`,
      403,
    );
  }

  const fileType = await FileType.fileTypeFromBuffer(buffer);

  if (!fileType || !options.allowedMimeTypes.includes(fileType.mime)) {
    throw new ApiError(
      `نوع الملف ${fieldName} غير مسموح به: ${fileType?.mime}`,
      403,
    );
  }
}

export async function validateUploadedFileDisk(
  file: Express.Multer.File,
  options: ValidateFileOptions,
) {
  const buffer = await fs.readFile(file.path);

  await validateUploadedFile(buffer, options, file.fieldname);

  return buffer;
}
