import * as fs from 'fs';

export async function readByte(
  filePath: string,
  callback: (arg: Buffer) => Promise<void>,
  length = 1,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath, { highWaterMark: length });

    let queue = Promise.resolve();

    fileStream.on('data', async (chunk: string | Buffer) => {
      queue = queue.then(async () => {
        await callback(chunk as Buffer);
      });
    });

    fileStream.on('end', async () => {
      await Promise.all([queue]);
      fileStream.destroy();
      resolve();
    });

    fileStream.on('error', (err) => {
      fileStream.destroy();
      reject(err);
    });
  });
}
