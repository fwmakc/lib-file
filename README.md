Простая библиотка, которая асинхронно работает с файлами.

# Конструктор

Класс File.

При создании передается путь к файлу, относительный или полный.

Пример:

```
const file = new File('src/files/names.txt');
```

> Создание класса не гарантирует наличие файла по заданному пути.

Не забудьте проверить существование файла и открыть поток для чтения или записи.

# Свойства

Свойства вычисляются после обращения к файлу. Например, при открытии потока:

```
const file = new File('src/files/names.txt');
await file.open('r');
```

Список свойств:

createdAt: number | null

Временная метка создания обращения к файлу, в мс.

dirPath: any = null

Путь к каталогу, где лежит файл.

extension: string

Расширение файла без точно.

fileName: any = null

Имя файла с расширением.

modifiedAt: number | null

Временная метка последнего изменения файла, в мс.

name: string

Имя файла без расширения.

mimeType: string

Mime-тип файла.

size: number | null

Размер файла в байтах.

# Методы

Список методов:

async clear(): Promise<void>

Очищает файл, если там есть содержимое.

async close(): Promise<void>

Закрывает поток.

> Не забывайте закрыть поток перед операциями копирования, перемещения, переименования и удаления!

async copy(dirPath: string, fileName = ''): Promise<void>

Копирует файл. Требует только каталог назначения. Вторым аргуметом можно указать новое имя файла с расширением. После завершения операции класс переключится на работу с новым файлом.

async create(): Promise<void>

Создает новый файл по заданному в классе пути.

async delete(): Promise<void>

Удаляет файл.

async exists(): Promise<boolean>

Проверяет, существует ли файл по заданному в классе пути. Возвращает true/false.

async mkdir(dirPath: string): Promise<void>

Создает путь, включая все промежуточные каталоги.

async move(dirPath: string, fileName = ''): Promise<void>

Перемещает файл. Требует только каталог назначения. Вторым аргуметом можно указать новое имя файла с расширением. После завершения операции класс переключится на работу с новым файлом.

async open(mode: 'a' | 'r' | 'w'): Promise<void>

Открывает поток. Возможные значения:

- a - поток для добавления в конец текущего содержимого,
- r - поток только для чтения,
- w - поток для записи, текущее содержимое файла будет очищено.

async read(): Promise<any>

Читает файл и возвращает содержимое.

> Нужно вручную открыть поток на чтение и закрыть его после завершения операции или в случае ошибки.

async readByte(callback: (arg: any) => Promise<void>, length = 1): Promise<any>

Читает файл по байтам. После чтения каждого байта вызывает функцию callback, в которую передает байт как объект Buffer.

Из него можно получить, например:

- значение в виде целого числа от 0 до 255 (byte[0]),
- значение в виде массива целых чисел (new Uint8Array(byte)).

Вторым необязательным аргументом можно указать, сколько байт читать за один проход. По-умолчанию 1 байт.

> Для этой операции автоматически создается отдельный изолированный поток, дополнительного управления не требуется.

async readFile(): Promise<any>

Читает файл и возвращает содержимое.

> Автоматически открывает и закрывает потоки, дополнительного управления не требуется.

async readLine(callback: (arg: any) => Promise<void>): Promise<any>

Читает файл построчно. После чтения каждой строки вызывает функцию callback, в которую передает строку.

> Для этой операции автоматически создается отдельный изолированный поток, дополнительного управления не требуется.

async rename(fileName: string): Promise<void>

Переименовывает файл вместе с расширением, оставляя его в текущем каталоге.

async write(data: string): Promise<void>

Записывает данные в файл.

> Нужно вручную открыть поток на запись и закрыть его после завершения операции или в случае ошибки.

async writeByte(buffer: Buffer): Promise<void>

Записывает в файл данные в виде последовательности байт как объекта Buffer.

> Нужно вручную открыть поток на запись и закрыть его после завершения операции или в случае ошибки.

async writeFile(data: string): Promise<void>

Записывает в файл данные в виде строки.

> Автоматически открывает и закрывает потоки, дополнительного управления не требуется.

async writeLine(data: string): Promise<void>

Записывает в файл данные в виде строки.

> Нужно вручную открыть поток на запись и закрыть его после завершения операции или в случае ошибки.

# Обработка ошибок

Все вызовы возвращают ошибки как есть, без дополнительных перехватов и обработки. Поэтому оборачиваем в try/catch самостоятельно.

```
async function readNames() {
  try {
    const file = new File('src/files/names.txt');
    await file.open('r');
    const content = await file.read();
    await file.close();

    return { content };
  } catch (e) {
    return { error: e.message };
  }
}
```

# Примеры

## Вызов файла

Не забываем открывать и закрывать поток.

```
const file = new File('src/files/names.txt');
await file.open('r');
console.log(file);
await file.close();
```

## Другие

```
try {
  const file = new File('src/files/names.txt');
  await file.open('r');
  console.log(file);

  const content = await file.read();
  console.log(content);

  await file.readLine(async (line) => {
    console.log('>>' + line);
  });

  await file.readByte(async (byte) => {
    const value = byte[0];
    const uint8Array = new Uint8Array(byte);
    console.log({ byte, value, uint8Array });
  });

  const filen = new File('src/files/names_new.txt');

  if (!(await filen.exists())) {
    await filen.create();
  } else {
    await filen.clear();
  }

  filen.open('a');

  await file.readLine(async (line) => {
    await filen.writeLine(line);
  });

  await file.readByte(async (byte) => {
    await filen.writeByte(byte);
  });

  await filen.close();

  await filen.delete();

  await file.close();

  await file.mkdir('src/files/inner');

  await file.copy('src/files/inner');
  console.log(file);

  await file.copy('src/files', 'names_copy.txt');
  console.log(file);

  await file.rename('names_renamed.txt');
  console.log(file);

  await file.move('src/files/inner');
  console.log(file);

  await file.move('src/files/inner', 'names_moved.txt');
  console.log(file);
} catch (e: any) {
  console.log('Error: ', e.message);
}
```
