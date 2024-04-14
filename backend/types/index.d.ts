import {Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction} from 'express'

export type User = {UUID: string, username: string, role: number, organisationId: string, recentlyLoggedIn?: boolean} // Without sensitive data.
export type Request = ExpressRequest & {user?:User}
export type Response = ExpressResponse
export type NextFunction = ExpressNextFunction

export type DefaultQuotaInput = {
    quotaTypeId: string, 
    value: number
}
