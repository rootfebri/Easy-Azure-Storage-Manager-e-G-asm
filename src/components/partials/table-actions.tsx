import {BadgePlus} from "lucide-react"
import {FC, useEffect, useState} from "react"
import {Button} from "@/components/ui/button.tsx"
import {ClassValue} from "clsx"
import {ContainerData, ListContainer} from "@/types/storage/list-container"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx"
import {DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx"
import {Input} from "@/components/ui/input.tsx"
import {Label} from "@/components/ui/label.tsx"
import {LoadingSpinner} from "@/components/partials/LoadingSpinner.tsx"
import {Storages, StorageValue, Subscriptions, SubscriptionValue} from "@/azure"
import {cn} from "@/lib/utils.ts"
import {toast} from "sonner"
import {useFetch} from "@/commands/invoker"
import delay from "delay"
import {getResourceGroup} from "@/models/store.ts";

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

export const SubscriptionList: FC<TSubscriptionList> = ({ name, data, setData, selectedSub, setSelectedSub, classWidth }) => {
    const [fetchData, setFetchData] = useState<boolean>(false)

    useEffect(() => {
        if (fetchData) {
            useFetch('get_subscriptions', {}, setData)
                .catch(err => {
                    toast.error(err.message ?? err)
                })
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
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedSub.id} onValueChange={(value) => {
                    data.value.map((mapValue) => {
                        if (value === mapValue.id)
                            setSelectedSub(mapValue)
                    })
                }}>
                    {fetchData && (
                        <LoadingSpinner />
                    )}
                    {data.value.map((value, index) => (
                        <DropdownMenuRadioItem key={index} value={value.id}>{value.displayName}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const StorageList: FC<TStorageList> = ({ name, subscription_id, data, selectedStorage, setData, setSelectedStorage, openCreateStorage, classWidth }) => {
    const [fetchData, setFetchData] = useState<boolean>(false)

    useEffect(() => {
        if (fetchData) {
            useFetch("get_storages", { subscription_id: subscription_id }, setData)
                .catch(err => toast.error(err.message || err))
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
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedStorage.name} onValueChange={(storageName) => {
                    data.value.map((storage) => {
                        if (storageName === storage.name) {
                            setSelectedStorage(storage)
                        }
                    })
                }}>
                    <DropdownMenuRadioItem onClick={() => openCreateStorage(true)} value="">
                        <div className="flex items-center gap-x-2"><BadgePlus size={16} />Create New</div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    {fetchData && (
                        <LoadingSpinner />
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
    const [resGrpName, setResGrpName] = useState<string>("")
    const [accName, setAccName] = useState<string | undefined>()
    const [disable, setDisabled] = useState<boolean>(true)
    const [response, setResponse] = useState<{ message: string }>({ message: "" })

    useEffect(() => {
        const asyncFetch = async () => {
            const resourceGroupName = await getResourceGroup()
            setResGrpName(resourceGroupName.value)
        }
        asyncFetch().finally()
    }, []);

    useEffect(() => {
        if (open && subscriptionId.length < 10) {
            setOpen(false)
            toast.warning("Select subscription id first!")
        }
    }, [open])

    useEffect(() => {
        if (fetchData) {
            (async () => {
                let toastId = toast.loading("Creating storage account...")
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
                while (response.message !== "created") {
                    toast.dismiss(toastId)
                    toastId = toast.loading(response.message)
                    await useFetch('create_storage', { url: url, data: body }, setResponse)
                        .catch(err => {
                            toast.dismiss(toastId)
                            throw new Error(err)
                        })
                    await delay(3000)
                }
                toast.success(`Storage ${accName} created successfully`)
                setOpen(false)
                toast.dismiss(toastId)
            })()
                .catch(err => toast.error(err.message || err))
                .finally(() => {
                    setFetchData(false)
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
                                Enter resource group name
                            </h1>
                            {resGrpName.length > 0 ? (
                                <Input
                                    onChange={(e) => setResGrpName(e.currentTarget.value)}
                                    disabled={true}
                                    value={resGrpName}
                                    type="text"
                                    id="resourceGroupName"
                                />
                            ) : (
                                <Input
                                    onChange={(e) => setResGrpName(e.currentTarget.value)}
                                    type="text"
                                    id="resourceGroupName"
                                    defaultValue={resGrpName}
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
        subscription_id: string;
        resource_group_name: string;
    }
}
export const ContainerList: FC<ContainerListProps & IClassWidht> = (props) => {
    const { require, name, setContainers, containers, classWidth, currentData, setCurrentData } = props
    const [fetchData, setFetchData] = useState<boolean>(false)
    useEffect(() => {
        if (fetchData) {
            setFetchData(false)
            if (require satisfies Required<ContainerListProps["require"]>) {
                useFetch('list_container', {
                    storage_name: require.storage_name,
                    subscription_id: require.subscription_id,
                    resource_group_name: require.resource_group_name
                }, setContainers)
                    .catch(err => toast.error(err.message || err))
                    .finally(() => setFetchData(false))
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

    const [isCreatingContainer, setCreatingContainer] = useState<boolean>(false)
    const [newCtrName, setNewCtrName] = useState<string>("")
    const [useFetchResponse, setUseFetchResponse] = useState<any>()
    useEffect(() => {
        if (useFetchResponse) {
            if (typeof useFetchResponse === 'number' && useFetchResponse >= 200 && useFetchResponse <= 299) {
                toast.success('Container created successfully')
            } else {
                toast.warning(useFetchResponse)
            }
        }
    }, [useFetchResponse]);

    return (
        <div className="flex flex-col items-center gap-2">
            {!isCreatingContainer
                ?
                <Button variant="outline" onClick={() => setCreatingContainer(true)} className="flex items-center gap-x-2"><BadgePlus size={16}/>Create New</Button>
                :
                <div className="relative">
                    <Input
                        type="text"
                        onChange={(e) => setNewCtrName(e.currentTarget.value)}
                        onBlur={() => setCreatingContainer(false)}
                        onAbort={() => setCreatingContainer(false)}
                        placeholder="name (Enter to submit)"
                        value={newCtrName}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const toaster = toast.loading("Creating container...")
                                useFetch('create_container', { ...require, container_name: newCtrName }, setUseFetchResponse)
                                    .finally(() => {
                                        toast.dismiss(toaster)
                                        setCreatingContainer(false)
                                        setNewCtrName("")
                                    })
                            }
                        }}
                    />
                </div>
            }
            <DropdownMenu onOpenChange={setFetchData}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">{currentData?.name || "Select Container"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={cn([classWidth, "overflow-auto", "max-h-64"])}>
                    <DropdownMenuLabel>Select {name}</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuRadioGroup value={currentData?.name} onValueChange={handleOnValueChange}>
                        {fetchData && <LoadingSpinner/>}
                        {containers?.value?.map(container => (
                            <DropdownMenuRadioItem key={container.id} value={container.name}>{container.name}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

interface TableActionsProps {
    storage: Storages;
    containers: ListContainer;
    subscriptions: Subscriptions;
    setStorage: (storage: Storages) => void;
    setContainers: (containers: ListContainer) => void;
    setSubscriptions: (subscriptions: Subscriptions) => void;
    setActiveStorage: (activeStorage: string | null) => void;
    setActiveContainer: (activeContainer: string | null) => void;
    setActiveSubscription: (activeSubscription: string | null) => void;
}

export const TableActions: FC<TableActionsProps> = ({
    storage,
    containers,
    subscriptions,
    setStorage,
    setContainers,
    setSubscriptions,
    setActiveStorage,
    setActiveContainer,
    setActiveSubscription,
}) => {
    const [selectedSub, setSelectedSub] = useState<SubscriptionValue>({ id: "", displayName: "", subscriptionId: "" } as SubscriptionValue);
    const [selectedStorage, setSelectedStorage] = useState<StorageValue>({ name: "" } as StorageValue);
    const [selectedContainer, setSelectedContainer] = useState<ContainerData>({ name: "" } as ContainerData);
    const [openCreateStorage, setOpenCreateStorage] = useState<boolean>(false);

    const [resourceGroupName, setResourceGroupName] = useState<string>("")
    useEffect(() => {
        const fetchData = async () => {
            const data = await getResourceGroup()
            setResourceGroupName(data.value)
        }

        fetchData().finally()
    }, [resourceGroupName]);

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
                        require={{ storage_name: selectedStorage.name, subscription_id: selectedSub.subscriptionId, resource_group_name: resourceGroupName }}
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