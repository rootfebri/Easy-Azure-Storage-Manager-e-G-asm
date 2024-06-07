import { Button } from "@/components/ui/button"
import { TStateFn } from "@/types"

interface ClearSelectedProps<TData> {
    data: TData[]
    selected: TData[]
    setData: TStateFn<TData[]>
}
export const ClearSelected = <TData,>({data, selected, setData}: ClearSelectedProps<TData>) => {
    const clearSelected = () => {
        setData(data.filter((item) => !selected.includes(item)))
    }

    return (
        <Button variant="destructive" size='sm' onClick={clearSelected}>Clear Selected</Button>
    )
}

interface UploadAllProps<TValue> {
    setIsUploading: TStateFn<TValue>
}
export const UploadAll = <TValue,>({setIsUploading}: UploadAllProps<TValue>) => {
    const uploadAll = () => {
        setIsUploading(true as TValue)
    }

    return (
        <Button variant="secondary" size='sm' onClick={uploadAll}>Upload ALL</Button>
    )
}
