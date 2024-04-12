import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"



export function ScannerPage() {
    return (
        <div className="container py-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 w-full">
                <div className="flex flex-col w-full gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{`Scan Ticket`}</CardTitle>
                            <CardDescription>Scan a ticket and consume a quota. Yum 😋</CardDescription>
                        </CardHeader>
                        <CardContent>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-1">
                </div>
            </div>
        </div>
    )
}
