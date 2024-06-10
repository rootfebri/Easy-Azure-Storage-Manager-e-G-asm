import { getAccessToken } from "@/models/store";
import { invoke } from "@tauri-apps/api/core";

export const useFetch = async <TData>(
    command: string,
    args: Record<string, unknown>,
    setData: (data: TData) => void,
): Promise<void> => {
    const token = await getAccessToken()
    if (token) {
        if (token.expired_on < Date.now()) {
            throw new Error("Access token expired, go to Settings to revoke old one and get a new one");
        }
        return invoke<TData>(command, { ...args, access_token: token.value })
            .then((data) => setData(data))
            .catch((err) => {
                throw new Error(err);
            });
    }
    else {
        throw new Error("No access token found, go to Settings to get access token");
    }
}
