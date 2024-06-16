import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getActiveRSN = (): string => {
    return <string>localStorage.getItem(import.meta.env.VITE_RSC_STORAGE_KEY)
}

export const setActiveRSN = (value: string) => {
    localStorage.setItem(import.meta.env.VITE_RSC_STORAGE_KEY, value)
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