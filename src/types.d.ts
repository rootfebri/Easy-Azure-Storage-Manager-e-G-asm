import {NewContainer, NewStorage, OAuthError, StorageAccountCheckNameAvailability} from "@/azure";

export type AzureResponse = OAuthError | NewContainer | NewStorage | StorageAccountCheckNameAvailability
export type TStateFn<T> = ((value: T) => void)
