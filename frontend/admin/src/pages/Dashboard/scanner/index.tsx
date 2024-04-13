import { queryClient } from "@/lib/api";
import { getOne as ticketGetOne } from "@/lib/api/ticket";
import { consumeOne as quotaConsume } from "@/lib/api/quota";
import { getAll as quotaTypeGetAll } from "@/lib/queries/quotaType"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Combobox } from "@/components/combo-box";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { getGenericTableColumns } from "@/components/data-table-custom-columns";
import useLocalStorage from "@/hooks/useLocalStorage";
import { DataTableActionsCell } from "@/components/data-table-custom-columns/actions-cell";
import { DataTableActionsHeader } from "@/components/data-table-custom-columns/actions-header";
import { Link } from "react-router-dom";
import { Ticket as TicketIc, TicketSlash, TrashIcon } from "lucide-react";
import { GenericNavigatorButtonAction } from "@/components/data-table-custom-columns/cell-actions";
import { Row } from "@tanstack/react-table";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Ticket } from "@/lib/api/data-types";
import { useToast } from "@/components/ui/use-toast";
import { GenericDialogConfirmButton } from "@/components/custom-buttons";


const scannerDivId = "qr-code-reader"

interface ScannedTicketQuotaHistory {
    UUID: string,
    ticketId: string,
    ticketOwnerName: string,
    quotaId: string,
    quotaTypeName: string
}

export const HistoryEntryViewTicketAction = () => GenericNavigatorButtonAction({
    actionId: "view_scanEntry_ticket",
    getTo: (row: Row<ScannedTicketQuotaHistory>) => `/dashboard/ticket/details/${row.original.ticketId}`,
    triggerNode: (
        <>
            <TicketIc className="mr-2 w-4 h-4" />
            View ticket details
        </>
    )
});

export const HistoryEntryViewQuotaAction = () => GenericNavigatorButtonAction({
    actionId: "view_scanEntry_quota",
    getTo: (row: Row<ScannedTicketQuotaHistory>) => `/dashboard/quota/details/${row.original.quotaId}`,
    triggerNode: (
        <>
            <TicketSlash className="mr-2 w-4 h-4" />
            View quota details
        </>
    )
});

export const getScanHistoryTableColumns = getGenericTableColumns<ScannedTicketQuotaHistory>(
    ({ actionsHeaderProps, actionsCellProps }) => ([
        {
            id: "UUID",
            accessorKey: 'UUID',
            header: DataTableColumnHeader,
            hidden: true
        },
        {
            id: "Ticket Id",
            accessorKey: "ticketId",
            header: DataTableColumnHeader,
            cell: ({row}) => (<Link to={`/dashboard/ticket/details/${row.original.ticketId}`}>{row.original.ticketId}</Link>)
        },
        {
            id: "Ticket Owner",
            accessorKey: "ticketOwnerName",
            header: DataTableColumnHeader
        },
        {
            id: "Quota Id",
            accessorKey: "quotaId",
            header: DataTableColumnHeader,
            cell: ({row}) => (<Link to={`/dashboard/quota/details/${row.original.quotaId}`}>{row.original.quotaId}</Link>)
        },
        {
            id: "Consumed Quota Type",
            accessorKey: "quotaTypeName",
            header: DataTableColumnHeader
        },
        {
            id: "actions",
            header: ({ table }) => {
                return (
                    <DataTableActionsHeader
                        table={table}
                        actions={[]}
                        {...actionsHeaderProps}
                    />
                )
            },
            cell: ({ row }) => {
                return (
                    <DataTableActionsCell
                        row={row}
                        actions={[
                            HistoryEntryViewTicketAction(),
                            HistoryEntryViewQuotaAction()
                        ]}
                        {...actionsCellProps}
                    />
                )
            },
            enableSorting: false,
            enableHiding: false,
        },
    ])
)

export function DeleteScanHistoryButton({deleteHandler}: {deleteHandler: ()=>Promise<boolean>|boolean}) {
    return GenericDialogConfirmButton({
        actionHandler: async () => await deleteHandler(),
        triggerNode: (
            <Button variant={"destructive"}>
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Local Scan History
            </Button>
        ),
        queriesInvalidator: ()=>{},
        dialogOptions: {
            title: "Confirm Deletion",
            description: "The deleted history is not going to be recoverable afterwards.\nAre you sure you would like to proceed?",
        },
        toasts: {
            onSuccess: () => ({
                title: "Successfully deleted scan history!"
            }),
            onFailure: () => ({
                title: "Failed to delete scan history",
                variant: "destructive"
            })
        }
    })
}

export function ScannerPage() {
    const { data: quotaTypes } = useQuery(quotaTypeGetAll, queryClient)
    const [chosenQuotaTypeId, setChosenQuotaTypeId] = useState("")
    const [cameraDevices, setCameraDevices] = useState<{ value: string, label: string }[]>([])
    const [selectedCamera, setSelectedCamera] = useState('')
    const [scannerState, setScannerState] = useState(false)
    const [dummy, setDummy] = useState(false)
    const [validTicket, setValidTicket] = useState(false)
    const [detectedTicket, setDetectedTicket] = useState<Ticket|undefined>()
    const [scanHistory, setScanHistory] = useLocalStorage<ScannedTicketQuotaHistory[]>('local_scan_history', [])
    const scannerRef = useRef<Html5Qrcode | undefined>();
    const {toast} = useToast()

    const qrboxSizeCalculator = (vfwidth: number, vfheight: number) => {
        const minEdgePercentage = 0.7; // 70%
        const minEdgeSize = Math.min(vfwidth, vfheight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
            width: qrboxSize,
            height: qrboxSize
        };
    }

    const onSuccess = async (decoded: string) => {
        const expectedUUID = decoded.split('/').pop() || ""
        console.log(expectedUUID)
        try {
            const ticket = await ticketGetOne(expectedUUID)
            setDetectedTicket(ticket);
            setValidTicket(true);
        } catch (e) {
            return
        }
    }

    const onConsume = async () => {
        console.log(validTicket, detectedTicket)
        if (detectedTicket===undefined) return;
        if ((detectedTicket.quotas||[]).filter((e)=>e.quotaTypeId===chosenQuotaTypeId).length) {
            const quota = (detectedTicket.quotas||[]).filter((e)=>e.quotaTypeId===chosenQuotaTypeId)[0];
            const success = await quotaConsume(quota.UUID);
            if (success) {
                setScanHistory([{
                    UUID:scanHistory.length.toString().padStart(8, '0'), 
                    quotaId:quota.UUID, 
                    quotaTypeName: quota.quotaType?.name || "", 
                    ticketId:detectedTicket.UUID, 
                    ticketOwnerName: detectedTicket.ownerName}, ...scanHistory])
                    toast({title:"Successfully scanned ticket, consumed a quota ✔"})
            } else {
                toast({title:"Failed to scan ticket, something went wrong", variant:'destructive'})
            }
        } else {
            toast({title:"Failed to scan ticket, something went wrong", variant:'destructive'})
        }
        setDetectedTicket(undefined);
        setValidTicket(false);
    }

    const createScanner = () => {
        try {
            const scanner = new Html5Qrcode(scannerDivId, { verbose: false })
            scannerRef.current = scanner
            // cleanup function when component will unmount
            return () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                switch (scannerRef.current?.getState()) {
                    case Html5QrcodeScannerState.SCANNING:
                        scannerRef.current?.stop().catch((e) => console.log(e));
                        break;
                }
            };
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        try {
            Html5Qrcode.getCameras().then((res) => {
                // if (res.length) setSelectedCamera(res[0].id);
                setCameraDevices(res.map((e) => ({ value: e.id, label: e.label })))
            }, () => { })
            // when component mounts
            return createScanner()
        } catch (e) {
            console.log(e)
        }
    }, []);

    useEffect(() => {
        // console.log(scannerState, scannerRef.current?.getState())
        if (scannerRef.current === undefined) {
            createScanner()
            setDummy((e) => !e);
            return;
        }
        if (scannerState) {
            switch (scannerRef.current?.getState()) {
                case Html5QrcodeScannerState.UNKNOWN:
                case Html5QrcodeScannerState.NOT_STARTED:
                    if (selectedCamera) scannerRef.current?.start({ deviceId: selectedCamera }, { qrbox: qrboxSizeCalculator, fps: 10 }, onSuccess, () => { })
                    else scannerRef.current?.start({ facingMode:'environment' }, { qrbox: qrboxSizeCalculator, fps: 10 }, onSuccess, () => { })
                    break;
                case Html5QrcodeScannerState.PAUSED:
                    scannerRef.current?.resume()
                    break;
                case Html5QrcodeScannerState.SCANNING:
                    break;
            }
        } else {
            switch (scannerRef.current?.getState()) {
                case Html5QrcodeScannerState.SCANNING:
                    // scannerRef.current?.pause();
                    scannerRef.current?.stop().catch((e) => console.log(e));
                    break;
            }
        }
    }, [scannerState, dummy, cameraDevices])

    useEffect(() => {
        if (validTicket) scannerRef.current?.pause();
        else scannerRef.current?.resume();
    }, [validTicket])

    if (quotaTypes === undefined) return <></>

    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`Scan Ticket`}</CardTitle>
                            <CardDescription>Scan a ticket and consume a quota. Yum 😋</CardDescription>
                        </CardHeader>
                        <CardContent className="gap-2">
                            <div id={scannerDivId}></div>
                        </CardContent>
                        <CardFooter className="grid grid-row gap-2">
                            <div className="grid grid-rows-2 items-center">
                                <Label className="col-span-1">Quota Type to consume</Label>
                                <Combobox label="Quota" options={quotaTypes.map((e) => ({ value: e.UUID, label: e.name }))} onChange={setChosenQuotaTypeId} buttonProps={{disabled:scannerState}}/>
                            </div>
                            <div className="grid grid-rows-2 items-center mb-2">
                                <Label className="col-span-1">Camera to use</Label>
                                <Combobox label="Camera" initialValue={selectedCamera} options={cameraDevices} onChange={setSelectedCamera} buttonProps={{disabled:scannerState}}/>
                            </div>
                            <Button onClick={() => setScannerState((prv) => !prv)} className="w-full max-w-xs">{scannerState ? "Stop Scanning" : "Start Scanning"}</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{`Scanned Tickets`}</CardTitle>
                            <CardDescription>Scanned tickets history on this device.</CardDescription>
                            <CardDescription>{scanHistory.length} Entries found.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={getScanHistoryTableColumns()} data={scanHistory} />
                        </CardContent>
                        <CardFooter>
                            <DeleteScanHistoryButton deleteHandler={()=>{setScanHistory([]);return true;}}/>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <Drawer open={validTicket} onOpenChange={setValidTicket}>
                <DrawerContent>
                    <DrawerHeader>
                    <DrawerTitle>Confirm Consumption of a Quota</DrawerTitle>
                    <DrawerDescription>Ticket UUID - {detectedTicket?.UUID}</DrawerDescription>
                    </DrawerHeader>
                    <div className="text-base mx-4 text-accent-foreground">
                        Ticket Owner - {detectedTicket?.ownerName}
                    </div>
                    <div className="text-base mx-4 text-accent-foreground">
                        Quota Type - {chosenQuotaTypeId && (quotaTypes || []).filter((e)=>e.UUID===chosenQuotaTypeId)[0].name}
                    </div>
                    <div className="text-base mx-4 text-accent-foreground">
                        Quota Usage left - { 
                        (detectedTicket!==undefined 
                            && ((detectedTicket?.quotas || []).filter((e) => e.quotaTypeId==chosenQuotaTypeId)).length) 
                            && ((detectedTicket?.quotas || []).filter((e) => e.quotaTypeId==chosenQuotaTypeId))[0].usageLeft 
                        ? `${((detectedTicket?.quotas || []).filter((e) => e.quotaTypeId==chosenQuotaTypeId))[0].usageLeft} ✅`  : `0 ❌`
                        }
                    </div>
                    <DrawerFooter>
                    <Button onClick={onConsume} disabled={!(detectedTicket!==undefined && ((detectedTicket?.quotas || []).filter((e) => e.quotaTypeId==chosenQuotaTypeId)).length && ((detectedTicket?.quotas || []).filter((e) => e.quotaTypeId==chosenQuotaTypeId))[0].usageLeft)}>Confirm</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
