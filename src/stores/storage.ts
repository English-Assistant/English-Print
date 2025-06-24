import Dexie from 'dexie';
import type { StateStorage } from 'zustand/middleware';

// 1. 定义 Dexie 数据库实例
// 我们使用单例模式确保在整个应用中只有一个 Dexie 实例。
class EnglishPrintDB extends Dexie {
  // 'zustandStore' 是我们为 Zustand 持久化创建的表
  // 它需要符合 ZustandEntry 接口
  public zustandStore!: Dexie.Table<ZustandEntry<unknown>, number>;

  constructor() {
    super('EnglishPrintDB');
    this.version(1).stores({
      // "++id" 表示自增主键
      // "key"    是用来查询的索引，对应 Zustand store 的 name
      zustandStore: '++id, key',
    });
    this.zustandStore = this.table('zustandStore');
  }
}

interface ZustandEntry<T> {
  id?: number;
  key: string;
  value: T;
}

const db = new EnglishPrintDB();

// 3. 创建符合 Zustand PersistStorage 接口的适配器
const dexieStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log(name, 'has been restored');
    const entry = await db.zustandStore.get({ key: name });
    // Dexie/IndexedDB 存储的是对象，但 Zustand 的 persist 中间件期望存储的是字符串
    // 因此我们在 setItem 中序列化，在 getItem 中解析
    // createJSONStorage 会为我们处理这个过程，所以这里直接返回序列化后的字符串
    return entry ? (entry.value as string) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.log(name, 'has been saved');
    // 当状态更新时，我们通过 key (store 的 name) 找到记录并更新其 value
    const existingEntry = await db.zustandStore.get({ key: name });
    if (existingEntry) {
      await db.zustandStore.update(existingEntry.id!, { value });
    } else {
      // 如果是第一次存储，就创建一个新记录
      await db.zustandStore.add({ key: name, value });
    }
  },
  removeItem: async (name: string): Promise<void> => {
    console.log(name, 'has been removed');
    const entry = await db.zustandStore.get({ key: name });
    if (entry) {
      await db.zustandStore.delete(entry.id!);
    }
  },
};

export default dexieStorage;
