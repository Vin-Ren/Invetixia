import { DataTable } from "@/components/data-table"
import { getAll } from "@/lib/queries/ticket"
import { useQuery } from "@tanstack/react-query"

import { queryClient } from "@/lib/api"
import { RefreshDataButton } from "@/components/refresh-data-button"
import { getTicketTableColumns } from "./columns"
import { DialogButton, GenericIndexCreateButton } from "@/components/custom-buttons"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { sendTickets } from "@/lib/api/email"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


export function SendEmailsDialogButton(data: {sentCount: number, totalCount: number}) {
    return DialogButton<{limit?: number}>({
        triggerNode: (
            <Button variant={'secondary'}>
                <Mail className="mr-2 h-4 w-4" />
                Send Emails
            </Button>
        ),
        initializeDialogData: ({ setDialogData }) => { setDialogData({ limit: 0 }) },
        actionHandler: async ({ getDialogData }) => {
            return await sendTickets({limit: 0, ...(getDialogData() || {})})
        },
        queriesInvalidator: () => [queryClient, [getAll]],
        dialogContent: ({internalActionHandler, getDialogData, setDialogData}) => {
            return (
                <DialogContent className="sm:max-w-[512px]">
                    <DialogHeader>
                        <DialogTitle>Send Emails to ticket owners</DialogTitle>
                        <DialogDescription>{data.sentCount} out of {data.totalCount} emails sent.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label>Limit (100 max.)</Label>
                            <Input className="col-span-3"
                                value={(getDialogData?.().limit) ? (getDialogData?.().limit)?.toString() : ''}
                                onChange={(e) => setDialogData((data) => ({ ...data, limit: parseInt(e.target.value || '0') }))}></Input>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={"default"} type="submit" onClick={async () => await internalActionHandler()}>Save</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            )
        },
        toasts: {
            onSuccess: () => ({
                title: "Sent Emails!"
            }),
            onFailure: () => ({
                title: "Failed to send emails!",
                variant: "destructive"
            }),
        }
    })
}


export const TicketDashboard = () => {
    const { data } = useQuery(getAll, queryClient)
    const sentCount = data?.reduce((val, tick)=> {
        if (tick.sentEmail.length!=0) return val+1;
        return val;
    }, 0)
    if (data === undefined) return <></>

    return (
        <div className="container mx-auto py-10">
            <GenericIndexCreateButton/>
            <DataTable columns={getTicketTableColumns()} data={data} />

            <div className="flex flex-col gap-4">
                <div className="flex flex-1">
                    <RefreshDataButton query={getAll}/>
                </div>
                <div className="flex flex-1">
                    <SendEmailsDialogButton sentCount={sentCount || 0} totalCount={data.length}/>
                </div>
            </div>
        </div>
    )
}
