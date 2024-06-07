import {ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState,} from "@tanstack/react-table"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {DataTablePagination} from "@/components/table/DataTablePagination";
import {DataTableViewOptions} from "@/components/table/DataTableViewOptions";
import {Button} from "@/components/ui/button";
import {FileDown, FilePlus, Trash2} from "lucide-react";
import {TableActions} from "@/components/partials/table-actions.tsx";
import {Storages, Subscriptions} from "@/azure";
import {ListContainer} from "@/types/storage/list-container";
import { ClearSelected, UploadAll } from "@/components/partials/button-actions";
import { TStateFn } from "@/types";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    uploadBtnState: boolean
    fileLoader: TStateFn<boolean>
    setData: TStateFn<TData[]>
    setIsUploading: TStateFn<boolean>
    setActiveSubscription: TStateFn<string | null>
    setActiveStorage: TStateFn<string | null>
    setActiveContainer: TStateFn<string | null>
}

export const DataTable = <TData, TValue>({columns, data, uploadBtnState, fileLoader, setData, setIsUploading, setActiveSubscription, setActiveStorage, setActiveContainer}: DataTableProps<TData, TValue>) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const [storage, setStorage] = useState<Storages>({ value: [] })
    const [containers, setContainers] = useState<ListContainer>({value: []})
    const [subscriptions, setSubscriptions] = useState<Subscriptions>({ count: {type: '', value: 0}, value: [] })
    const [selectedDataForClearSelected, setSelectedDataForClearSelected] = useState<TData[]>([])

    useEffect(() => {
        setSelectedDataForClearSelected(table.getSelectedRowModel().rows.map((row) => row.original))
    }, [table.getSelectedRowModel().rows])

    return (
        <div className="my-4">
            <div className="flex items-center py-4">
                <div className={"flex justify-evenly items-center gap-4"}>
                    <Input
                        placeholder={`Filter (Status | Filename)`}
                        value={(table.getColumn("file")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => table.getColumn("file")?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />
                    <Button onClick={() => fileLoader(true)} variant='ghost'><FilePlus size={20}/>&nbsp;Add File</Button>
                    <Button variant='ghost'><FileDown size={20}/>&nbsp;Save to File</Button>
                    <Button onClick={() => setData([])} variant='ghost'><Trash2 size={20}/>&nbsp;Clear Table</Button>
                </div>
                <DataTableViewOptions table={table as any}/>
            </div>

            <div className={"flex items-center gap-4 px-2 my-10 justify-between"}>
                <TableActions
                    subscriptions={subscriptions}
                    setSubscriptions={setSubscriptions}
                    storage={storage}
                    setStorage={setStorage}
                    containers={containers}
                    setContainers={setContainers}
                    setActiveStorage={setActiveStorage}
                    setActiveSubscription={setActiveSubscription}
                    setActiveContainer={setActiveContainer}
                />
                <div className="flex items-center gap-4">
                    <UploadAll disabled={uploadBtnState} setIsUploading={setIsUploading} />
                    <ClearSelected data={data} selected={selectedDataForClearSelected} setData={setData} />
                </div>
            </div>

            <DataTablePagination table={table}/>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table}/>
        </div>
    );
}
