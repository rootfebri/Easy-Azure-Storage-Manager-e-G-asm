import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {DataTable} from "@/components/table/DataTable";
import {columns} from "@/components/table/columns";
import { basename, putBlob, setSasToken } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

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
        const newData: TData[] = await invoke("loadfile");

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
            setSasToken(activeStorage, activeSubscription)

            data.map((fileToUpload) => {
                setData((prevState) => prevState.map((item) => {
                    if (item.file === fileToUpload.file) {
                        return { ...item, status: 'uploading' }
                    }
                    return item;
                }))

                const status = putBlob(activeStorage, activeContainer, fileToUpload.file)
                if (status >= 200 && status <= 209) {
                    setData((prevState) => prevState.map((item) => {
                        if (item.file === fileToUpload.file) {
                            return { ...item, status: 'uploaded', url: `https://${activeStorage}.blob.storage.azure.com/${activeContainer}/${basename(fileToUpload.file)}` }
                        }
                        return item;
                    }))
                } else {
                    setData((prevState) => prevState.map((item) => {
                        if (item.file === fileToUpload.file) {
                            return { ...item, status: 'failed', url: '-' }
                        }
                        return item;
                    }))
                }
            })
        }
    }, [isUploading]);

    return (
        <div className="container">
            <DataTable
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
