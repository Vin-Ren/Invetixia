import { ColumnDef } from "@tanstack/react-table"
import { DataTableActionsHeaderProps } from "./actions-header-experimental"
import { DataTableActionsCellProps } from "./actions-cell"


export interface getGenericTableColumnsProps<TData> {
    disableColumnsById?: ("select" | "actions" | ColumnDef<TData>['id'])[],
    actionsHeaderProps?: Omit<DataTableActionsHeaderProps<TData>, "table" | "deleteSelected" | "queriesInvalidator">,
    actionsCellProps?: Omit<DataTableActionsCellProps<TData>, "row">
}

export function getGenericTableColumns<TData>(
    columnsGenerator: (_props: getGenericTableColumnsProps<TData>) => ColumnDef<TData>[]
): ((props?: getGenericTableColumnsProps<TData>) => ColumnDef<TData>[]) {
    return (props: getGenericTableColumnsProps<TData> = { disableColumnsById: [], actionsHeaderProps: {}, actionsCellProps: {} }): ColumnDef<TData>[] => {
        return columnsGenerator(props).filter(({ id = "" }) => !(props.disableColumnsById || []).includes(id))
    }
}
