Простая асинхронная работа с файлами.

Библиотка javascript/typescript (ES2022) для node.js.

- правильная последовательность выполнения асинхронных операций,
- информация о файле,
- простое чтение/запись с автоматическим управлением потоками,
- быстрое построчное чтение,
- побайтовое чтение,
- ручное управление потоками,
- побайтая запись.

# Установка

```
npm install lib-file
```

или

```
yarn add lib-file
```

Затем

```
import { File } from 'lib-file';
```

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

***createdAt: number | null***

Временная метка создания обращения к файлу, в мс.

***dirPath: any = null***

Путь к каталогу, где лежит файл.

***extension: string***

Расширение файла без точно.

***fileName: any = null***

Имя файла с расширением.

***modifiedAt: number | null***

Временная метка последнего изменения файла, в мс.

***name: string***

Имя файла без расширения.

***mimeType: string***

Mime-тип файла.

***size: number | null***

Размер файла в байтах.

# Методы

Список методов:

***async clear(): Promise<void>***

Очищает файл, если там есть содержимое.

***async close(): Promise<void>***

Закрывает поток, если он был создан.

***async copy(dirPath: string, fileName = ''): Promise<void>***

Копирует файл. Требует только каталог назначения. Вторым аргуметом можно указать новое имя файла с расширением.

> После завершения операции класс остается работать с исходным файлом. Поток также будет указывать на исходный файл. На новый не переключается.

***async create(): Promise<void>***

Простая инициализация файла. Если файл не существует, то создает новый файл по заданному в классе пути.

***async delete(): Promise<void>***

Удаляет файл.

> Перед удалением закрывает поток.

***async exists(): Promise<boolean>***

Проверяет, существует ли файл по заданному в классе пути. Возвращает true/false.

***async mkdir(dirPath: string): Promise<void>***

Создает путь, включая все промежуточные каталоги.

***async move(dirPath: string, fileName = ''): Promise<void>***

Перемещает файл. Требует только каталог назначения. Вторым аргуметом можно указать новое имя файла с расширением.

> После завершения операции класс работает с новым файлом. Поток также будет указывать на новый файл.

***async open(mode: 'a' | 'r' | 'w'): Promise<void>***

Открывает поток. Возможные значения:

- a - поток для добавления в конец текущего содержимого,
- r - поток только для чтения,
- w - поток для чтения и записи, текущее содержимое файла будет очищено.

> Закрывает предыдущий поток, если он был создан.

***async read(): Promise<string>***

Читает файл и возвращает содержимое.

> Нужно вручную открыть поток на чтение и закрыть его после завершения операции или в случае ошибки.

***async readByte(callback: (arg: Buffer) => Promise<void>, length = 1): Promise<void>***

Читает файл по байтам. После чтения каждого байта вызывает функцию callback, в которую передает байт как объект Buffer.

Из него можно получить, например:

- значение в виде целого числа от 0 до 255 (byte[0]),
- значение в виде массива целых чисел (new Uint8Array(byte)).

Вторым необязательным аргументом можно указать, сколько байт читать за один проход. По-умолчанию 1 байт.

> Для этой операции автоматически создается отдельный изолированный поток, дополнительного управления не требуется.

***async readFile(): Promise<any>***

Читает файл и возвращает содержимое.

> Автоматически открывает и закрывает потоки, дополнительного управления не требуется.

***async readLine(callback: (arg: string) => Promise<void>): Promise<void>***

Читает файл построчно. После чтения каждой строки вызывает функцию callback, в которую передает строку.

> Для этой операции автоматически создается отдельный изолированный поток, дополнительного управления не требуется.

***async rename(fileName: string): Promise<void>***

Переименовывает файл вместе с расширением, оставляя его в текущем каталоге.

***async write(data: string): Promise<void>***

Записывает данные в файл.

> Нужно вручную открыть поток на запись и закрыть его после завершения операции или в случае ошибки.

***async writeByte(buffer: Buffer): Promise<void>***

Записывает в файл данные в виде последовательности байт как объекта Buffer.

> Нужно вручную открыть поток на запись и закрыть его после завершения операции или в случае ошибки.

***async writeFile(data: string): Promise<void>***

Записывает в файл данные в виде строки.

> Автоматически открывает и закрывает потоки, дополнительного управления не требуется.

***async writeLine(data: string): Promise<void>***

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
  } catch (error) {
    return { error };
  }
}
```

# Примеры

## Вызов файла

```
const file = new File('src/files/names.txt');
await file.create();

console.log(file);
```

## Простое чтение файла

```
const file = new File('src/files/names.txt');
const content = await file.readFile();

console.log(content);
```

## Чтение файла с ручным управлением потоками

```
const file = new File('src/files/names.txt');
await file.open('r');
const content = await file.read();
await file.close();

console.log(content);
```

## Построчное чтение файла

```
const file = new File('src/files/names.txt');
await file.readLine(async (line) => {
  console.log('>' + line);
});
```

## Побайтовое чтение файла

```
const file = new File('src/files/names.txt');
await file.readByte(async (byte) => {
  const value = byte[0];
  const uint8Array = new Uint8Array(byte);

  console.log({ byte, value, uint8Array });
});
```

## Создание и очистка файла

```
const file = new File('src/files/names.txt');
await file.create();
await file.clear();
```

## Операции с файлами

```
const file = new File('src/files/names.txt');

await file.mkdir('src/files/inner');

await file.copy('src/files/inner');

await file.copy('src/files', 'names_copy.txt');

await file.rename('names_renamed.txt');

await file.move('src/files/inner');

await file.move('.', 'names_moved.txt');

await file.move('..', 'names_moved.txt');

await file.delete();
```

Обратите внимание:

- path - путь будет построен относительно домашнего каталога приложения,
- ./path и ../path - путь будет построен относительно текущего каталога файла,
- /path - путь будет построен относительно корневого каталога, например диска С в Windows или / в unix-системах.

> Для безопасности, всегда следите, какие именно данные будут переданы в качестве пути. Вы можете определить пути, начиная с __dirname + '/'

## Последовательное чтение и запись файла

```
const file = new File('src/files/names.txt');

const output = new File('src/files/names_new.txt');
await output.create();
await output.open('a');

await file.readLine(async (line) => {
  await output.writeLine(line);
});

await file.readByte(async (byte) => {
  await output.writeByte(byte);
});

await output.close();
```
