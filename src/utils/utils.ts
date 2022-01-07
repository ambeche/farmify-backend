import * as Fs from 'fs';
import { open } from 'fs/promises';

import path = require('path');

const csvDataFolderPath = path.join('./', '/data');
console.log('path', path.parse(__dirname).dir);

const getCsvFilesFromServer = (): string[] => {
  const filesOnServer = Fs.readdirSync(csvDataFolderPath).map((filename) =>
    path.join(csvDataFolderPath, filename)
  );

  return filesOnServer;
};

console.log('current', getCsvFilesFromServer());

const fileHandles: Promise<Fs.promises.FileHandle>[] =
  getCsvFilesFromServer().map(async (filePath) => await open(filePath, 'r'));

const parseCsvFiles = async () => {
  try {
    const resolvedFileHandles = await Promise.all(fileHandles);

    resolvedFileHandles.map((fileHandle) => {
      const fileStream = fileHandle.createReadStream();
      fileStream
        .on('data', (data) => {
          console.log('data', data.toString());
        })
        .on('end', () => {
          console.log('done');
        });
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.log('parse error', error.message);
  }
};

void parseCsvFiles();

export { getCsvFilesFromServer };
