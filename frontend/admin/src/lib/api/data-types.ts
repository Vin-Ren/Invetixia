

export interface Ticket {
    UUID: string,
    ownerName: string,
    ownerContacts: {
        email: string, 
        phone_number: string
    },
    ownerAffiliation?: Organisation,
    ownerAffiliationId: string,
    quotas?: Quota[],
    invitation?: Invitation,
    invitationId: string
}

export interface Quota {
    UUID: string,
    quotaType?: QuotaType,
    quotaTypeId: string,
    usageLeft: number,
    ticket?: Ticket,
    ticketId: string
}

export interface QuotaType {
    UUID: string,
    name: string,
    description: string,
    quotas?: Quota[],
    defaultQuotas?: DefaultQuota[]
}

export interface Invitation {
    UUID: string,
    name: string,
    publisher?: Organisation,
    organisationId: string,
    usageQuota: number,
    usageLeft: number,
    createdTickets?: Ticket[],
    defaultQuotas?: DefaultQuota[]
}

export interface DefaultQuota {
    UUID: string,
    invitation?: Invitation,
    invitationId: string,
    quotaType?: QuotaType,
    quotaTypeId: string,
    value: number
}

export interface Organisation {
    UUID: string,
    name: string,
    managers?: User[],
    top_manager?: User['username'],
    publishedInvitations?: Invitation[],
    createdTickets?: Ticket[],
    createdTicketCount?: number
}


export interface User {
    UUID: string,
    username: string,
    role: number,
    organisationId: string,
    organisationManaged?: Organisation
}


export interface UserSanitized extends User {
    role_string: string
}


export enum userRole {
    SUPER_ADMIN = 0b1000,
    ADMIN = 0b0100,
    ORGANISATION_MANAGER = 0b0010,
    OBSERVER = 0b0001
}


export interface EventInfo {
    name: string,
    description: string
}

export interface EventDetails {
    locationName: string,
    startTime: string
}

export interface EventSocials {
    mainWebsite: string,
    instagram: string,
    youtube: string,
    x_twitter: string,
    email: string
}
