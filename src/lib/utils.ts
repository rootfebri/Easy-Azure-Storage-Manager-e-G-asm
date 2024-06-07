import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { invoke } from "@tauri-apps/api/core"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getAccessToken = (): string => {
    return <string>localStorage.getItem(import.meta.env.VITE_MSAL_STORAGE_KEY)
}

export const setAccessToken = (token: string) => {
    localStorage.setItem(import.meta.env.VITE_MSAL_STORAGE_KEY, token)
}

export const getActiveRSN = (): string => {
    return <string>localStorage.getItem(import.meta.env.VITE_RSC_STORAGE_KEY)
}

export const setActiveRSN = (value: string) => {
    localStorage.setItem(import.meta.env.VITE_RSC_STORAGE_KEY, value)
}

export const getSasToken = (): string => {
    return <string>localStorage.getItem(import.meta.env.VITE_SAS_STORAGE_KEY)
}

type TResponse = {
    "accountSasToken": string
}

/**
 * @function setSasToken A function that generates a SAS token for an Azure Blob Storage container.
 * @param storage string Storage name
 * @param sub string Subscription ID
 */
export const setSasToken = (storage: string, sub: string): void => {
    invoke('generate_sas', { sub, storage, res: getActiveRSN(), access_token: getAccessToken() })
        .then((token) => localStorage.setItem(import.meta.env.VITE_SAS_STORAGE_KEY, (token as TResponse).accountSasToken))
        .catch((err) => console.error(err.message ?? err))
}

/**
 * @function putBlob A function that uploads a file to an Azure Blob Storage container.
 * @param storageName string Storage name
 * @param containerName string Container name
 * @param fullPathToFile string Full path to file
 * @returns number
 */
export const putBlob = (storageName: string, containerName: string, fullPathToFile: string): number => {
    const fileName = basename(fullPathToFile)
    const url = `https://${storageName}.blob.core.windows.net/${containerName}/${fileName}?${getSasToken()}`

    let code: number = 0;
    invoke('put_blob', { url, full_path_to_file: fullPathToFile })
        .then((resp) => code = resp as number)
        .catch((error) => code = error as number)

    return code
}

/**
 * @function basename A function to extract filename from a full path
 * @param path string Full path to file
 * @returns string
 */
export const basename = (path: string): string => {
    const parts = path.split(/[/\\]/);
    return <string>parts[parts.length - 1];
}