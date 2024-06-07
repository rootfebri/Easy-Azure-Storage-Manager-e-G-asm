import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {DataTable} from "@/components/table/DataTable";
import {columns} from "@/components/table/columns";

type data = {
    file: string | "";
    status: string | "";
    url: string | "";
}

const Home = () => {
    const [data, setData] = useState<data[]>([]);
    const [loadFile, setLoadFile] = useState<true | false>(false);

    const loadData = async () => {
        // Run file loader and save it to newData
        const newData: data[] = await invoke("loadfile");

        // Perform simple duplicate file with same status
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

    return (
        <div className="container">
            <DataTable data={data as any} columns={columns} fileLoader={setLoadFile} clearTable={setData}/>
        </div>
    );
}

export default Home;
