import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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

export const setActiveSharedKey = (value: string): void => {
    localStorage.setItem(import.meta.env.VITE_CTRKEY_STORAGE_KEY, value)
}
