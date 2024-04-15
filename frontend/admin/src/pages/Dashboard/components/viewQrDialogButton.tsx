import { DialogButton } from "@/components/custom-buttons"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"


export function ViewQRDialogButton({ QrLink, QrImgSource }: { QrLink: string, QrImgSource: string }) {
    return DialogButton({
        triggerNode: (
            <Button variant={'outline'}>
                <QrCode className="mr-2 h-4 w-4" />
                View QR
            </Button>
        ),
        actionHandler: () => true,
        queriesInvalidator: () => { },
        dialogContent: () => {
            return (
                <DialogContent className="sm:max-w-[412px]">
                    <DialogHeader>
                        <DialogTitle>View QR</DialogTitle>
                        <DialogDescription>
                            Scan or copy the link below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-1 flex-col align-middle justify-center gap-2">
                        <img src={QrImgSource} className="rounded-lg mb-2"></img>
                        <Button asChild variant={'link'}>
                            <a href={QrLink} target="_blank" className="text-wrap">{QrLink}</a>
                        </Button>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={"default"}>Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            )
        }
    })
}
