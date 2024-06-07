import {DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx"
import {Button} from "@/components/ui/button.tsx"
import {cn, getAccessToken, getActiveRSN} from "@/lib/utils.ts"
import {ClassValue} from "clsx"
import {FC, useEffect, useState} from "react"
import {Storages, StorageValue, Subscriptions, SubscriptionValue} from "@/azure"
import {invoke} from "@tauri-apps/api/core"
import {toast} from "sonner"
import {BadgePlus} from "lucide-react"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx"
import {Label} from "@/components/ui/label.tsx"
import {Input} from "@/components/ui/input.tsx"
import {LoadingSpinner} from "@/components/partials/LoadingSpinner.tsx"
import delay from "delay"
import {ListContainer, ContainerData} from "@/types/storage/list-container";

interface IClassWidht {
    classWidth?: ClassValue[] | ["w-56"]
}
interface TableActionProps {
    name: string
    data: Subscriptions
    selectedSub: SubscriptionValue
    setData: (value: Subscriptions) => void
    setSelectedSub: (value: SubscriptionValue) => void
}
interface StorageListProps {
    name: string
    subscription_id: string
    data: Storages
    selectedStorage: StorageValue
    setData: (value: Storages) => void
    setSelectedStorage: (value: StorageValue) => void
    openCreateStorage: (value: boolean) => void
}
interface CreateStorageProps {
    subscriptionId: string
    setOpen: (value: boolean) => void
    open: boolean
}

export type TSubscriptionList = TableActionProps & IClassWidht
export type TStorageList = StorageListProps & IClassWidht

export const SubscriptionList:FC<TSubscriptionList> = ({ name, data, setData, selectedSub, setSelectedSub, classWidth}) => {
    const [fetchData, setFetchData] = useState<boolean>(false)

    useEffect(() => {
        if (fetchData) {
            invoke('get_subscriptions', {accessToken: getAccessToken()})
                .then((data) => setData(data as Subscriptions))
                .catch(err => toast.error(err.message))
                .finally(() => setFetchData(false))
        }
    }, [fetchData])

    return (
        <DropdownMenu onOpenChange={setFetchData}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{selectedSub.id ? selectedSub.displayName : name}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn([classWidth, "overflow-auto", "max-h-64"])}>
                <DropdownMenuLabel>Select {name}</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuRadioGroup value={selectedSub.id} onValueChange={(value) => {
                    data.value.map((mapValue) => {
                        if (value === mapValue.id)
                            setSelectedSub(mapValue)
                    })
                }}>
                    {fetchData && (
                        <LoadingSpinner/>
                    )}
                    {data.value.map((value, index) => (
                        <DropdownMenuRadioItem key={index} value={value.id}>{value.displayName}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const StorageList:FC<TStorageList> = ({name, subscription_id, data, selectedStorage, setData, setSelectedStorage, openCreateStorage, classWidth}) => {
    const [fetchData, setFetchData] = useState<boolean>(false)

    useEffect(() => {
        if (fetchData) {
            invoke('get_storages', {subscription_id: `${subscription_id}`, access_token: `${getAccessToken()}`})
                .then((data) => setData(data as Storages))
                .catch(err => toast.error(err))
                .finally(() => setFetchData(false))
        }
    }, [fetchData])

    return (
        <DropdownMenu onOpenChange={setFetchData}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{selectedStorage.id ? selectedStorage.name : name}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn([classWidth, "overflow-auto", "max-h-64"])}>
                <DropdownMenuLabel>Select {name}</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuRadioGroup value={selectedStorage.name} onValueChange={(storageName) => {
                    data.value.map((storage) => {
                        if (storageName === storage.name) {
                            setSelectedStorage(storage)
                        }
                    })
                }}>
                    <DropdownMenuRadioItem onClick={() => openCreateStorage(true)} value="">
                        <div className="flex items-center gap-x-2"><BadgePlus size={16}/>Create New</div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuSeparator/>
                    {fetchData && (
                        <LoadingSpinner/>
                    )}
                    {data.value.map((storage) => (
                        <DropdownMenuRadioItem key={storage.id} value={storage.name}>
                            {storage.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export const CreateStorage: FC<CreateStorageProps> = ({ subscriptionId, open, setOpen }) => {
    const [fetchData, setFetchData] = useState<boolean>(false)
    const [resGrpName, setResGrpName] = useState<string>(getActiveRSN())
    const [accName, setAccName] = useState<string | undefined>()
    const [disable, setDisabled] = useState<boolean>(true)
    const [is200, setIs200] = useState<boolean>(false)

    useEffect(() => {
        if (open && subscriptionId.length < 10) {
            setOpen(false)
            toast.warning("Select subscription id first!")
        }
    }, [open])

    useEffect(() => {
        if (fetchData) {
            const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resGrpName}/providers/Microsoft.Storage/storageAccounts/${accName}?api-version=2023-01-01`
            const body = {
                kind: "StorageV2",
                location: "Southeast Asia",
                sku: {
                    name: "Standard_GRS",
                    tier: "Standard"
                },
                properties: {
                    allowBlobPublicAccess: true,
                    allowSharedKeyAccess: true,
                    minimumTlsVersion: "TLS1_1",
                }
            }
            let toastId = toast.loading("Creating storage account...")

            invoke('create_storage', { data: body, url, access_token: getAccessToken() })
                .then(async (res: any) => {
                    toast.dismiss(toastId)
                    if (res.message) {
                        toastId = toast.loading(res.message)
                        const checkStatus = async () => {
                            while (!is200) {
                                const lres: any = await invoke('create_storage', { url: url, access_token: getAccessToken(), data: body }).then((res) => res)
                                if (!lres.message) {
                                    toast.dismiss(toastId)
                                    toast.success(`Storage ${accName} created successfully`)
                                    setIs200(true)
                                    break
                                } else {
                                    await delay(5000)
                                }
                            }
                        }
                        await checkStatus()
                        setOpen(false)
                    } else {
                        toast.info("Perhaps this storage already yours?")
                    }
                })
                .catch(err => {
                    toast.dismiss(toastId)
                    toast.error(err.message ?? err)
                })
                .finally(() => {
                    toast.dismiss(toastId)
                    setFetchData(false)
                    setIs200(false)
                })
        }
    }, [fetchData])

    useEffect(() => {
        if (resGrpName && accName && resGrpName.length > 1 && accName.length > 1) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [accName, resGrpName])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New StorageV2 account</DialogTitle>
                    <DialogDescription>Create new public ACL StorageV2 account</DialogDescription>
                </DialogHeader>
                <div className={cn("grid items-start gap-4")}>
                    <div className="grid gap-2">
                        <Label>
                            <h1>Storage Name/Account Name</h1>
                            <Input
                                type="text"
                                id="accountName"
                                defaultValue={accName}
                                onChange={(e) => setAccName(e.target.value)}
                            />
                        </Label>
                        <Label>
                            <h1>
                                {getActiveRSN()?.length > 0 ? "Resource Group Name (Got from setting)" : "Enter resource group name"}
                            </h1>
                            {getActiveRSN()?.length > 0 ? (
                                <Input
                                    onChange={(inp) => setResGrpName(inp.currentTarget.value)}
                                    disabled={true}
                                    value={getActiveRSN()}
                                    type="text"
                                    id="resourceGroupName"
                                />
                            ) : (
                                <Input
                                    onChange={(inp) => setResGrpName(inp.currentTarget.value)}
                                    type="text"
                                    id="resourceGroupName"
                                    defaultValue={getActiveRSN() ?? ""}
                                />
                            )}
                        </Label>
                    </div>
                    <Button disabled={disable || fetchData} type="submit" onClick={() => setFetchData(true)}>
                        {fetchData ? <LoadingSpinner /> : "Create"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}


interface ContainerListProps {
    name: string | undefined
    containers: ListContainer | undefined;
    setContainers: (containers: ListContainer) => void;
    currentData: ContainerData | undefined;
    setCurrentData: (currentData: ContainerData) => void;
    require: {
        storage_name: string;
        access_token: string;
        subscription_id: string;
        resource_group_name: string;
    }
}
export const ContainerList:FC<ContainerListProps & IClassWidht> = (props) => {
    const {require, name, setContainers, containers, classWidth, currentData, setCurrentData} = props
    const [fetchData, setFetchData] = useState<boolean>(false)
    useEffect(() => {
        if (fetchData) {
            setFetchData(false)
            if (require satisfies Required<ContainerListProps["require"]>) {
                invoke('list_container', {
                    storage_name: require.storage_name,
                    access_token: getAccessToken(),
                    subscription_id: require.subscription_id,
                    resource_group_name: require.resource_group_name
                }).then((resp) => {
                    setContainers(resp as ListContainer)
                }).catch(err => toast.error(err.message ?? err))
            }
        }
    }, [fetchData])

    const handleOnValueChange = (inferredData: string) => {
        containers?.value?.map(container => {
            if (container.name === inferredData) {
                setCurrentData(container)
            }
        })
    }

    return (
        <DropdownMenu onOpenChange={setFetchData}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{currentData?.name || "Select Container"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn([classWidth, "overflow-auto", "max-h-64"])}>
                <DropdownMenuLabel>Select {name}</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuRadioGroup value={currentData?.name} onValueChange={handleOnValueChange}>
                    <DropdownMenuRadioItem onClick={() => {}} value="">
                        <div className="flex items-center gap-x-2"><BadgePlus size={16}/>Create New</div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuSeparator/>
                    {fetchData && <LoadingSpinner/>}
                    {containers?.value?.map(container => (
                        <DropdownMenuRadioItem key={container.id} value={container.name}>{container.name}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const CreateContainer = () => {}

interface TableActionsProps {
    subscriptions: Subscriptions;
    setSubscriptions: (subscriptions: Subscriptions) => void;
    storage: Storages;
    setStorage: (storage: Storages) => void;
    containers: ListContainer;
    setContainers: (containers: ListContainer) => void;
    setActiveStorage: (activeStorage: string | null) => void;
    setActiveContainer: (activeContainer: string | null) => void;
    setActiveSubscription: (activeSubscription: string | null) => void;
}

export const TableActions: FC<TableActionsProps> = ({
    subscriptions,
    setSubscriptions,
    storage,
    setStorage,
    containers,
    setContainers,
    setActiveStorage,
    setActiveContainer,
    setActiveSubscription,
}) => {
    const [selectedSub, setSelectedSub] = useState<SubscriptionValue>({ id: "", displayName: "", subscriptionId: "" } as SubscriptionValue);
    const [selectedStorage, setSelectedStorage] = useState<StorageValue>({ name: "" } as StorageValue);
    const [selectedContainer, setSelectedContainer] = useState<ContainerData>({ name: "" } as ContainerData);
    const [openCreateStorage, setOpenCreateStorage] = useState<boolean>(false);

    useEffect(() => {
        setActiveStorage(selectedStorage.name)
        setActiveContainer(selectedContainer.name)
        setActiveSubscription(selectedSub.subscriptionId)
    }, [selectedStorage, selectedSub, selectedContainer])
    
    return (
        <div className="flex items-center gap-4 rounded-xl">
            <CreateStorage
                open={openCreateStorage}
                setOpen={setOpenCreateStorage}
                subscriptionId={selectedSub.subscriptionId}
            />
            <SubscriptionList
                name="Subscription"
                data={subscriptions}
                setData={setSubscriptions}
                setSelectedSub={setSelectedSub}
                selectedSub={selectedSub}
            />
            {selectedSub.subscriptionId && (
                <>
                    <StorageList
                        openCreateStorage={setOpenCreateStorage}
                        subscription_id={selectedSub.subscriptionId}
                        data={storage}
                        setData={setStorage}
                        selectedStorage={selectedStorage}
                        setSelectedStorage={setSelectedStorage}
                        name="Storage"
                    />
                    <ContainerList
                        require={{ storage_name: selectedStorage.name, access_token: getAccessToken(), subscription_id: selectedSub.subscriptionId, resource_group_name: getActiveRSN() }}
                        name="Container"
                        setContainers={setContainers}
                        containers={containers}
                        currentData={selectedContainer}
                        setCurrentData={setSelectedContainer}
                    />
                </>
            )}
        </div>
    );
};