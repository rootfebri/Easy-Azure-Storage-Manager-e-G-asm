import {DataTable} from "@/components/table/DataTable";
import {columns} from "@/components/table/columns";
import {basename} from "@/lib/utils";
import {ColumnDef} from "@tanstack/react-table";
import {invoke} from "@tauri-apps/api/core";
import {open} from "@tauri-apps/plugin-dialog";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {useFetch} from "@/commands/invoker.ts";
import {SasToken} from "@/models/models.ts";
import {getResourceGroup} from "@/models/store.ts";

export type TData = {
    file: string | "";
    status: "loaded" | "uploading" | "failed" | "uploaded" | "";
    url: string | "";
}

const Home = () => {
    const [data, setData] = useState<TData[]>([]);
    const [loadFile, setLoadFile] = useState<true | false>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [activeStorage, setActiveStorage] = useState<string | null>(null);
    const [activeContainer, setActiveContainer] = useState<string | null>(null);
    const [activeSubscription, setActiveSubscription] = useState<string | null>(null);

    const openFileLoader = async () => {
        const lastPath = localStorage.getItem("lastPath") || ".";
        const files = await open({
            multiple: true,
            title: "Select Files",
            filters: [{
                extensions: ["html", "html5", "htm", 'xml'],
                name: ""
            }],
            defaultPath: lastPath,
        });
        if (files) {
            localStorage.setItem("lastPath", files[0].path);
        }

        setData((prevState) => {
            const newState = [...prevState];
            files?.forEach((newItem) => {
                if (!newState.some(item => item.file === newItem.path)) {
                    newState.push({
                        file: newItem.path,
                        status: "loaded",
                        url: "-",
                    });
                }
            });
            return newState;
        });
    }

    useEffect(() => {
        if (loadFile) openFileLoader().finally(() => setLoadFile(false));
    }, [loadFile]);

    const [newSasToken, setNewSasToken] = useState<SasToken>({accountSasToken: ""});
    const upload = async () => {
        const toaster = toast.loading("Uploading...")
        setTimeout(() => {
            const {accountSasToken} = newSasToken
            if (accountSasToken.length < 1) {
                toast.dismiss(toaster)
                toast.info("No SAS token found, try again")
                return
            }
            data.map((fileToUpload) => {
                if (fileToUpload.status === 'uploaded') return;
                setData((prevState) => prevState.map((item) => {
                    if (item.file === fileToUpload.file) {
                        return { ...item, status: 'uploading' }
                    }
                    return item;
                }))

                const fileName = basename(fileToUpload.file)
                const url = `https://${activeStorage}.blob.core.windows.net/${activeContainer}/${fileName}`

                invoke<number | string>('put_blob', { url: `${url}?${accountSasToken}` , full_path_to_file: fileToUpload.file })
                    .then((resp) => {
                        if (resp as number >= 200 && resp as number <= 209) {
                            setData((prevState) => prevState.map((item) => {
                                if (item.file === fileToUpload.file) {
                                    return { ...item, status: 'uploaded', url: url }
                                }
                                return item;
                            }))
                        }
                        else {
                            setData((prevState) => prevState.map((item) => {
                                if (item.file === fileToUpload.file) {
                                    return { ...item, status: 'failed', url: '-' }
                                }
                                return item;
                            }))
                        }
                    })
            })
            toast.dismiss(toaster)
            toast.success("Done!")
        }, 1500)
    }
    const [resourceGroupName, setResourceGroupName] = useState<string>("");
    useEffect(() => {
        const fetchData = async () => {
            const data = await getResourceGroup()
            setResourceGroupName(data.value)
        }
        fetchData().finally()
    }, [resourceGroupName])

    useEffect(() => {
        if (isUploading && data.length > 0 && activeStorage && activeSubscription && activeContainer) {
            useFetch('generate_sas', {storage: activeStorage, sub: activeSubscription, res: resourceGroupName}, setNewSasToken).finally()
            upload().finally(() => setIsUploading(false))
        }
    }, [isUploading]);

    return (
        <div className="container">
            <DataTable
                uploadBtnState={isUploading || data.length < 1 || !activeStorage || !activeSubscription || !activeContainer}
                data={data}
                columns={columns as ColumnDef<typeof data[0], any>[]}
                fileLoader={setLoadFile}
                setData={setData}
                setIsUploading={setIsUploading}
                setActiveSubscription={setActiveSubscription}
                setActiveStorage={setActiveStorage}
                setActiveContainer={setActiveContainer}
            />
        </div>
    );
}
export default Home;
