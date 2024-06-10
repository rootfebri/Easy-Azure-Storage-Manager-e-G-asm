import {ColumnDef} from "@tanstack/react-table"
import {Checkbox} from "@/components/ui/checkbox";
import {DataTableColumnHeader} from "@/components/table/DataTableColumnHeader";
import UrlComponent from "@/components/table/UrlComponent";
import {DropdownMenuTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

type TColumns = {
    file: string;
    status: string;
    url: string;
};

export const columns: ColumnDef<TColumns>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "file",
        header: ({column}) => <DataTableColumnHeader column={column} title="File"/>,
        cell: ({row}) => <p className={"text-primary"}>{row.original.file.split("/")[row.original.file.split("/").length - 1] || row.original.file}</p>,
    },
    {
        accessorKey: "status",
        header: ({column}) => <DataTableColumnHeader column={column} title="Status"/>,
        cell: ({row}) => <p className={"text-primary"}>{row.original.status}</p>,
    },
    {
        accessorKey: "url",
        header: ({column}) => <DataTableColumnHeader column={column} title="Generated URL"/>,
        cell: ({row}) => <UrlComponent url={row.original.url}/>,
    },
    {
        id: "actions",
        header: () => <div>Action</div>,
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <DotsHorizontalIcon className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.file)}>Copy filename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.url)}>Copy Generated URL</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    },
]
