import {Request as ExpressRequest, Response, NextFunction} from 'express'

export type User = {UUID: string, username: string, role: number, organisationId: string} // Without sensitive data.
export type Request = ExpressRequest & {user?:User}
export type Response = Response
export type NextFunction = NextFunction

export type DefaultTicketInput = {
    quotaTypeId: string, 
    value: number
}
