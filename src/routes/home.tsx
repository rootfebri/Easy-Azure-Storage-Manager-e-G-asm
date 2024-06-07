import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {DataTable} from "@/components/table/DataTable";
import {columns} from "@/components/table/columns";
import { basename, getSasToken, setSasToken } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export type TData = {
    file: string | "";
    status: "loaded" | "uploading" | "failed" | "uploaded" | "";
    url: string | "";
}

const Home = () => {
    const [data, setData] = useState<TData[]>([]);
    const [loadFile, setLoadFile] = useState<true | false>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [activeSubscription, setActiveSubscription] = useState<string | null>(null);
    const [activeStorage, setActiveStorage] = useState<string | null>(null);
    const [activeContainer, setActiveContainer] = useState<string | null>(null);

    const loadData = async () => {
        const newData: TData[] = await invoke("load_file");

        setData((prevState) => {
            const newState = [...prevState];
            newData.forEach((newItem) => {
                if (!newState.some(item => item.file === newItem.file && item.status === newItem.status)) {
                    newState.push(newItem);
                }
            });

            return newState;
        });
    }

    useEffect(() => {
        if (loadFile) {
            loadData()
                .finally(() => setLoadFile(false));
        }
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

    const [onlyLoaded, setOnlyLoaded] = useState<number>(0);
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
