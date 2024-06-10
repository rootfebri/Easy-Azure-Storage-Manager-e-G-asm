import { DataTable } from "@/components/table/DataTable";
import { columns } from "@/components/table/columns";
import { getAppData } from "@/lib/orm";
import { basename, getSasToken, setSasToken } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Store } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type TData = {
    file: string | "";
    status: "loaded" | "uploading" | "failed" | "uploaded" | "";
    url: string | "";
}

const Home = () => {
    const [appsData, setAppsData] = useState<any>(null);
    useEffect(() => {
        getAppData("appClientID").then((data) => {
            setAppsData(data)
        })
        if (!appsData) {
            const app = new Store('AppData.bin');
            app.set("appClientID", "0000-00000-11111111111");
            app.save();
        }
        console.log(appsData)
    }, [])
    const [data, setData] = useState<TData[]>([]);
    const [loadFile, setLoadFile] = useState<true | false>(false);
    const [onlyLoaded, setOnlyLoaded] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [activeStorage, setActiveStorage] = useState<string | null>(null);
    const [activeContainer, setActiveContainer] = useState<string | null>(null);
    const [activeSubscription, setActiveSubscription] = useState<string | null>(null);

    const openFileLoader = async () => {
        const files = await open({
            multiple: true,
            title: "Select Files",
            filters: [{
                extensions: ["html", "html5", "htm"],
                name: ""
            }],
            defaultPath: ".",
        });

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
    
    useEffect(() => {
        if (isUploading && data.length > 0 && activeStorage && activeSubscription && activeContainer) {
            setIsUploading(false)

            // TODO: Implement for token is it expired
            // if (getSasToken().length < 10) {
            //     setSasToken(activeStorage, activeSubscription)
            // }
            setSasToken(activeStorage, activeSubscription)

            data.map((fileToUpload) => {
                setData((prevState) => prevState.map((item) => {
                    if (item.file === fileToUpload.file) {
                        return { ...item, status: 'uploading' }
                    }
                    return item;
                }))

                const fileName = basename(fileToUpload.file)
                const url = `https://${activeStorage}.blob.core.windows.net/${activeContainer}/${fileName}`

                invoke('put_blob', { url: `${url}?${getSasToken()}`, full_path_to_file: fileToUpload.file })
                    .then((resp) => {
                        // Success status
                        if (resp as number >= 200 && resp as number <= 209) {
                            setData((prevState) => prevState.map((item) => {
                                if (item.file === fileToUpload.file) {
                                    return { ...item, status: 'uploaded', url: url }
                                }
                                return item;
                            }))
                        }
                        // Error status
                        else {
                            setData((prevState) => prevState.map((item) => {
                                if (item.file === fileToUpload.file) {
                                    return { ...item, status: 'failed', url: '-' }
                                }
                                return item;
                            }))

                            throw new Error(resp as string)
                        }
                    })
                    // Catch all
                    .catch((error) => {
                        const message = `Error uploading ${fileToUpload.file} to ${activeStorage}: ${error.message ?? error}`
                        toast.error(message)
                    })
            })
        }
    }, [isUploading]);

    useEffect(() => {
        setOnlyLoaded(data.filter((item) => item.status === 'loaded').length)
    }, [data]);

    return (
        <div className="container">
            <DataTable
            uploadBtnState={isUploading || data.length < 1 || !activeStorage || !activeSubscription || !activeContainer || onlyLoaded < 1}
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
