import {FC} from "react";
import {LoaderCircle} from "lucide-react";

interface LoadingSpinnerProps {
    size?: number;
}
export const LoadingSpinner:FC<LoadingSpinnerProps> = props => {
    return (
        <div className="flex justify-center items-center my-2">
            <LoaderCircle size={props.size} className="animate-spin size-8 text-blue-500"/>
        </div>
    )
}