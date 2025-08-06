import * as fsPromises from 'fs/promises';
import path from 'path';
import { fileOpen } from './helpers/file_open.helper';
import { filePaths } from './helpers/file_paths.helper';
import { fileStats } from './helpers/file_stats.helper';
import { readLine } from './helpers/read_line.helper';
import { fileExists } from './helpers/file_exists.helper';
import { readByte } from './helpers/read_byte.helper';

/**
 * Class representing a file with various operations such as reading, writing, and moving.
 */
export class File {
  protected _createdAt: number | null = null;
  protected _dirPath: any = null;
  protected _extension = '';
  protected _fileName: any = null;
  protected _modifiedAt: number | null = null;
  protected _name = '';
  protected _mimeType = '';
  protected _size: number | null = null;

  private filePath = '';
  private fileHandle: any;

  /**
   * Get file creation timestamp.
   */
  get createdAt() {
    return this._createdAt;
  }
  set createdAt(value: any) {}

  /**
   * Get directory path.
   */
  get dirPath() {
    return this._dirPath;
  }
  set dirPath(value: any) {}

  /**
   * Get file extension.
   */
  get extension() {
    return this._extension;
  }
  set extension(value: any) {}

  /**
   * Get file name with extension.
   */
  get fileName() {
    return this._fileName;
  }
  set fileName(value: any) {}

  /**
   * Get file last modification timestamp.
   */
  get modifiedAt() {
    return this._modifiedAt;
  }
  set modifiedAt(value: any) {}

  /**
   * Get file name without extension.
   */
  get name() {
    return this._name;
  }
  set name(value: any) {}

  /**
   * Get file MIME type.
   */
  get mimeType() {
    return this._mimeType;
  }
  set mimeType(value: any) {}

  /**
   * Get file size in bytes.
   */
  get size() {
    return this._size;
  }
  set size(value: any) {}

  /**
   * Creates an instance of File.
   * @param {string} filePath - Path to file.
   */
  constructor(filePath: string) {
    this.filePaths(filePath);
  }

  /**
   * Initializes file properties based on given file path.
   * @param {string} userPath - User-provided path to file.
   * @private
   */
  private filePaths(userPath: string): void {
    const { dirPath, extension, fileName, filePath, name, mimeType } =
      filePaths(userPath);

    this.filePath = filePath;

    this._dirPath = dirPath;
    this._extension = extension;
    this._fileName = fileName;
    this._name = name;
    this._mimeType = mimeType;
  }

  /**
   * Retrieves file statistics and updates file properties.
   * @returns {Promise<void>} A promise that resolves when file stats are retrieved.
   * @private
   */
  private async fileStats(): Promise<void> {
    const { createdAt, modifiedAt, size } = await fileStats(this.filePath);

    this._createdAt = createdAt;
    this._modifiedAt = modifiedAt;
    this._size = size;
  }

  /**
   * Clears content of file.
   * @returns {Promise<void>} A promise that resolves when file content is cleared.
   */
  async clear(): Promise<void> {
    await fsPromises.truncate(this.filePath, 0);
  }

  /**
   * Closes file handle if it is open.
   * @returns {Promise<void>} A promise that resolves when file is closed.
   */
  async close(): Promise<void> {
    if (!this.fileHandle) {
      return;
    }
    await this.fileHandle.close();
  }

  /**
   * Copies file to a specified directory with an optional new name.
   * @param {string} dirPath - Directory where file should be copied.
   * @param {string} [fileName=''] - New name for copied file (optional).
   * @returns {Promise<void>} A promise that resolves when file is copied.
   */
  async copy(dirPath: string, fileName = ''): Promise<void> {
    const startPath = dirPath.startsWith('.') ? this._dirPath : '';
    const destinationPath = path.join(
      startPath,
      dirPath,
      fileName || this._fileName,
    );
    await fsPromises.copyFile(this.filePath, destinationPath);
  }

  /**
   * Creates file if it does not exist, or opens it if it already exists.
   * @returns {Promise<void>} A promise that resolves when file is created or opened.
   */
  async create(): Promise<void> {
    if (await this.exists()) {
      await this.open('r');
      await this.close();
      return;
    }

    await this.mkdir(this.dirPath);
    await this.writeFile('');
  }

  /**
   * Deletes file from filesystem.
   * @returns {Promise<void>} A promise that resolves when file is deleted.
   */
  async delete(): Promise<void> {
    await this.close();
    await fsPromises.unlink(this.filePath);
  }

  /**
   * Checks if file exists.
   * @returns {Promise<boolean>} A promise that resolves to true if file exists, otherwise false.
   */
  async exists(): Promise<boolean> {
    return await fileExists(this.filePath);
  }

  /**
   * Creates a directory if it does not exist.
   * @param {string} dirPath - Directory path to create.
   * @returns {Promise<void>} A promise that resolves when directory is created.
   */
  async mkdir(dirPath: string): Promise<void> {
    await fsPromises.mkdir(dirPath, { recursive: true });
  }

  /**
   * Moves file to a specified directory with an optional new name.
   * @param {string} dirPath - Directory to move file to.
   * @param {string} [fileName=''] - New name for moved file (optional).
   * @returns {Promise<void>} A promise that resolves when file is moved.
   */
  async move(dirPath: string, fileName = ''): Promise<void> {
    const startPath = dirPath.startsWith('.') ? this._dirPath : '';
    const destinationPath = path.join(
      startPath,
      dirPath,
      fileName || this._fileName,
    );
    await fsPromises.rename(this.filePath, destinationPath);
    this.filePaths(destinationPath);
  }

  /**
   * Opens file with specified mode.
   * @param {'a' | 'r' | 'w'} mode - Mode in which to open file ('a' for append, 'r' for read, 'w' for write).
   * @returns {Promise<void>} A promise that resolves when file is opened.
   */
  async open(mode: 'a' | 'r' | 'w'): Promise<void> {
    await this.close();
    this.fileHandle = await fileOpen(this.filePath, mode);
    await this.fileStats();
  }

  /**
   * Reads entire content of file.
   * @returns {Promise<any>} A promise that resolves to content of file.
   */
  async read(): Promise<any> {
    return await fsPromises.readFile(this.filePath, 'utf8');
  }

  /**
   * Reads a specified number of bytes from file and executes a callback with data.
   * @param {(arg: Buffer) => Promise<void>} callback - Callback to execute with read bytes.
   * @param {number} [length=1] - Number of bytes to read (optional).
   * @returns {Promise<void>} A promise that resolves when read operation is complete.
   */
  async readByte(
    callback: (arg: Buffer) => Promise<void>,
    length = 1,
  ): Promise<void> {
    readByte(this.filePath, callback, length);
  }

  /**
   * Reads content of file and automatically closes file handle afterwards.
   * @returns {Promise<any>} A promise that resolves to content of file.
   */
  async readFile(): Promise<any> {
    await this.open('r');
    return await this.read().finally(async () => {
      await this.close();
    });
  }

  /**
   * Reads a line from file and executes a callback with read line.
   * @param {(arg: string) => Promise<void>} callback - Callback to execute with each line read from file.
   * @returns {Promise<void>} A promise that resolves when operation is complete.
   */
  async readLine(callback: (arg: string) => Promise<void>): Promise<void> {
    readLine(this.filePath, callback);
  }

  /**
   * Renames file to a new name within same directory.
   * @param {string} fileName - New name for file.
   * @returns {Promise<void>} A promise that resolves when file is renamed.
   */
  async rename(fileName: string): Promise<void> {
    const destinationPath = path.join(this._dirPath, fileName);
    await fsPromises.rename(this.filePath, destinationPath);
    this.filePaths(destinationPath);
  }

  /**
   * Writes data to file using open file handle.
   * @param {string} data - Data to write to file.
   * @returns {Promise<void>} A promise that resolves when data is written.
   */
  async write(data: string): Promise<void> {
    await this.fileHandle.writeFile(data);
    await this.fileStats();
  }

  /**
   * Appends a buffer to file using open file handle.
   * @param {Buffer} buffer - Buffer to append to file.
   * @returns {Promise<void>} A promise that resolves when buffer is written.
   */
  async writeByte(buffer: Buffer): Promise<void> {
    await this.fileHandle.appendFile(buffer);
    await this.fileStats();
  }

  /**
   * Writes data to file after opening it in write mode. File handle will be closed afterwards.
   * @param {string} data - Data to write to file.
   * @returns {Promise<void>} A promise that resolves when data is written.
   */
  async writeFile(data: string): Promise<void> {
    await this.open('w');
    return await this.write(data).finally(async () => {
      await this.close();
    });
  }

  /**
   * Writes a line of data to file, appending a newline character if file is not empty.
   * @param {string} data - Line of data to write to file.
   * @returns {Promise<void>} A promise that resolves when line is written.
   */
  async writeLine(data: string): Promise<void> {
    const eof = this._size ? '\n' : '';
    await this.fileHandle.appendFile(eof + data);
    await this.fileStats();
  }
}
