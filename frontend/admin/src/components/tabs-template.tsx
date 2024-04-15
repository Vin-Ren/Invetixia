import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"


export interface TabsEntryProps {
    id: string,
    label?: string,
    tabContent: () => React.ReactNode
}


export interface TabsTemplateProps {
    tabs: TabsEntryProps[],
    defaultTabId?: string
}


export function TabsTemplate({ tabs, defaultTabId = undefined }: TabsTemplateProps) {
    return (
        <div className="container py-4 flex justify-center">
            <Tabs defaultValue={(defaultTabId===undefined) ? (tabs.at(0)?.id) : defaultTabId} className="w-full">
                <TabsList className={`grid w-full grid-cols-${tabs.length}`}>
                    {
                        tabs.map(({ id, label = undefined }) => {
                            return <TabsTrigger value={id}>{label ? label : id}</TabsTrigger>
                        })
                    }
                </TabsList>
                {
                    tabs.map(({ id, tabContent }) => {
                        return (
                            <TabsContent value={id}>
                                {tabContent()}
                            </TabsContent>
                        )
                    })
                }
            </Tabs>
        </div>
    )
}
