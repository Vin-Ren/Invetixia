import { User } from "../types";
import { userRole } from "../database";

export const isAdmin = (user: User | undefined) => {
    return user && user.role>=userRole.ADMIN
}

export const isOrganisationManager = (user: User|undefined, organisationId: string) => {
    return user && (!(user.role < userRole.ORGANISATION_MANAGER))
        && ((user.role >= userRole.ADMIN) || user.organisationId === organisationId);
}
