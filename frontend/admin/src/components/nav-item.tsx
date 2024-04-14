import { NavLink, NavLinkProps } from "react-router-dom";
import { buttonVariants } from "./ui/button";

type _NavLinkProps = React.ForwardRefExoticComponent<NavLinkProps & React.RefAttributes<HTMLAnchorElement>> | NavLinkProps

export default function NavItem(props: _NavLinkProps) {
    return <NavLink {...{
        to: '/',
        className: ({ isActive }: { isActive: boolean }) => `w-full ${buttonVariants({ variant: isActive ? 'default' : 'ghost' })}`,
        ...props
    }}/>
}
