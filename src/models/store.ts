import {Store} from '@tauri-apps/plugin-store'
import {AccessToken, AppData, ResourceGroupName} from '@/models/models'

const appDataStore = new Store('.appdata.bin')

export const setAppData = async (data: AppData) => {
    await appDataStore.set('appData', data)
    await appDataStore.save()
}
export const setAccessToken = async (token: AccessToken) => {
    await appDataStore.set('accessToken', token)
    await appDataStore.save()
}
export const setResourceGroup = async (data: ResourceGroupName) => {
    await appDataStore.set('resourceGroup', data)
    await appDataStore.save()
}

export const getAppData = async () => {
    return await appDataStore.get<AppData>('appData')
}
export const getAccessToken = async () => {
    return await appDataStore.get<AccessToken>('accessToken')
}
export const getResourceGroup = async () => {
    return await appDataStore.get<ResourceGroupName>('resourceGroup') || {value: ''}
}