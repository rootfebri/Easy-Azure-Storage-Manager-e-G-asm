import {Store} from '@tauri-apps/plugin-store'
import {AccessToken, AppData} from '@/models/models'

const appDataStore = new Store('.appdata.bin')
const tokenBinStorage = new Store('.accesstoken.bin')

export const setAppData = async (data: AppData) => {
    await appDataStore.set('appData', data)
    await appDataStore.save()
}

export const setAccessToken = async (token: AccessToken) => {
    await tokenBinStorage.set('accessToken', token)
    await tokenBinStorage.save()
}

export const getAppData = async () => {
    return await appDataStore.get<AppData>('appData')
}

export const getAccessToken = async () => {
    return await tokenBinStorage.get<AccessToken>('accessToken')
}
