import {open} from "@tauri-apps/plugin-dialog";
import {toast} from "sonner";
import {invoke} from "@tauri-apps/api/core";
import {columns} from "@/components/table/columns";
import {DataTable} from "@/components/table/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {basename, getSasToken, setSasToken} from "@/lib/utils";

export type TData = {
    file: string | "";
    status: "loaded" | "uploading" | "failed" | "uploaded" | "";
    url: string | "";
}

const Home = () => {
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
