import * as fsPromises from 'fs/promises';
import path from 'path';
import { fileOpen } from './helpers/file_open.helper';
import { filePaths } from './helpers/file_paths.helper';
import { fileStats } from './helpers/file_stats.helper';
import { readLine } from './helpers/read_line.helper';
import { fileExists } from './helpers/file_exists.helper';
import { readByte } from './helpers/read_byte.helper';

export class File {
  createdAt: number | null;
  dirPath: any = null;
  extension: string;
  fileName: any = null;
  modifiedAt: number | null;
  name: string;
  mimeType: string;
  size: number | null;

  private filePath: string;
  private fileHandle: any;

  constructor(filePath: string) {
    this.filePaths(filePath);
  }

  private filePaths(userPath: string): void {
    const { dirPath, extension, fileName, filePath, name, mimeType } =
      filePaths(userPath);

    this.dirPath = dirPath;
    this.extension = extension;
    this.fileName = fileName;
    this.filePath = filePath;
    this.name = name;
    this.mimeType = mimeType;
  }

  private async fileStats(): Promise<void> {
    const { createdAt, modifiedAt, size } = await fileStats(this.filePath);

    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.size = size;
  }

  async clear(): Promise<void> {
    await fsPromises.truncate(this.filePath, 0);
  }

  async close(): Promise<void> {
    await this.fileHandle.close();
  }

  async copy(dirPath: string, fileName = ''): Promise<void> {
    const destinationPath = path.join(dirPath, fileName || this.fileName);
    await fsPromises.copyFile(this.filePath, destinationPath);
    this.filePaths(destinationPath);
  }

  async create(): Promise<void> {
    await this.write('');
  }

  async delete(): Promise<void> {
    await fsPromises.unlink(this.filePath);
  }

  async exists(): Promise<boolean> {
    return await fileExists(this.filePath);
  }

  async mkdir(dirPath: string): Promise<void> {
    await fsPromises.mkdir(dirPath, { recursive: true });
  }

  async move(dirPath: string, fileName = ''): Promise<void> {
    const destinationPath = path.join(dirPath, fileName || this.fileName);
    await fsPromises.rename(this.filePath, destinationPath);
    this.filePaths(destinationPath);
  }

  async open(mode: 'a' | 'r' | 'w'): Promise<void> {
    this.fileHandle = await fileOpen(this.filePath, mode);
    await this.fileStats();
  }

  async read(): Promise<any> {
    return await fsPromises.readFile(this.filePath, 'utf8');
  }

  async readByte(
    callback: (arg: any) => Promise<void>,
    length = 1,
  ): Promise<any> {
    return readByte(this.filePath, callback, length);
  }

  async readFile(): Promise<any> {
    await this.open('r');
    return await this.read().finally(async () => {
      await this.close();
    });
  }

  async readLine(callback: (arg: any) => Promise<void>): Promise<any> {
    return readLine(this.filePath, callback);
  }

  async rename(fileName: string): Promise<void> {
    const destinationPath = path.join(this.dirPath, fileName);
    await fsPromises.rename(this.filePath, destinationPath);
    this.filePaths(destinationPath);
  }

  async write(data: string): Promise<void> {
    await this.fileHandle.writeFile(data);
    await this.fileStats();
  }

  async writeByte(buffer: Buffer): Promise<void> {
    await this.fileHandle.appendFile(buffer);
    await this.fileStats();
  }

  async writeFile(data: string): Promise<void> {
    await this.open('w');
    return await this.write(data).finally(async () => {
      await this.close();
    });
  }

  async writeLine(data: string): Promise<void> {
    const eof = this.size ? '\n' : '';
    await this.fileHandle.appendFile(eof + data);
    await this.fileStats();
  }
}
