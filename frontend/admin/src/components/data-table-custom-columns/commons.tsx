import { InvalidateQueryFilters, QueryClient } from "@tanstack/react-query";


export type QueriesInvalidatorType<TData> = (data: TData) => [QueryClient, InvalidateQueryFilters[]] | Promise<void> | void;


export interface BaseAction<TWrappedData, BaseToast = unknown> {
    actionType: string;
    actionId: string;
    triggerNode: React.ReactNode | React.ReactNode[];
    queriesInvalidator?: QueriesInvalidatorType<TWrappedData>;
    toasts?: {
        onSuccess?: BaseToast;
        onFailure?: BaseToast;
    };
}
