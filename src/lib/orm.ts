import {Store} from '@tauri-apps/plugin-store';

export const getAppData = (key: string) => {
    const data = new Store('AppData.bin');
    return data.get(key);
}

export type TKey<T> = T extends string | number ? T : never;
export type TData<K extends string | number, V> = Record<K, V>;
export const setAppData = async (key: TKey<any>, data: TData<any, unknown>) => {
    const appData = new Store('AppData.bin');
    appData.set(key, data);
    await appData.save();
}

