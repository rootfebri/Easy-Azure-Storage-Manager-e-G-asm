import { Store } from '@tauri-apps/plugin-store';
import { AppData, AccessToken } from './models';

const appDataStore = new Store('.appdata.bin');
const accessTokenStore = new Store('.accesstoken.bin');

export const setAppData = async (data: AppData) => {
    await appDataStore.set('appData', data);
    await appDataStore.save();
};

export const getAppData = async (): Promise<AppData | null> => {
    const data = await appDataStore.get('appData');
    return data as AppData | null;
};

export const setAccessToken = async (token: AccessToken) => {
    await accessTokenStore.set('accessToken', token);
    await accessTokenStore.save();
};

export const getAccessToken = async (): Promise<AccessToken | null> => {
    const token = await accessTokenStore.get('accessToken');
    return token as AccessToken | null;
};