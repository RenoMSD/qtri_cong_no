const DB = 'newcredit-so';
const STORE = 'tep';

function moDb(): Promise<IDBDatabase> {
  return new Promise((ok, err) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => err(req.error ?? new Error('Không mở được kho sổ'));
  });
}

export async function luuTepSo(ten: string, buf: ArrayBuffer) {
  const db = await moDb();
  await new Promise<void>((ok, err) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ ten, buf }, 'ky');
    tx.oncomplete = () => ok();
    tx.onerror = () => err(tx.error ?? new Error('Không lưu được sổ'));
  });
  db.close();
}

export async function docTepSo(): Promise<{ ten: string; buf: ArrayBuffer } | null> {
  const db = await moDb();
  const row = await new Promise<{ ten: string; buf: ArrayBuffer } | undefined>((ok, err) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get('ky');
    req.onsuccess = () => ok(req.result as { ten: string; buf: ArrayBuffer } | undefined);
    req.onerror = () => err(req.error ?? new Error('Không đọc được sổ đã lưu'));
  });
  db.close();
  if (!row?.buf) return null;
  return row;
}
