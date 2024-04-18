import { QueryClient, useQuery } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { OptionalSocialLink } from "./components/socials";

import { TbWorldWww } from "react-icons/tb";
import { FaSlackHash, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { eventQuery, posterImageQuery } from "./queries";
import { Helmet } from "react-helmet-async";
import { getBase64FromBlurhash } from "./lib/utils";

export const loader = (queryClient: QueryClient) => {
    return async () => {
        if (!queryClient.getQueryData(eventQuery.queryKey)) {
            await queryClient.fetchQuery(eventQuery)
        }
        return null
    }
}


export default function Layout() {
    const { data: { event: { name, socials = null } } } = useQuery(eventQuery)
    const { data: posterImage = '' } = useQuery(posterImageQuery)
    const blurhashImg = getBase64FromBlurhash(import.meta.env.VITE_EVENT_POSTER_IMAGE_BLURHASH, window.innerWidth, window.innerHeight)
    const iconSize = 24

    return (
        <div className="min-h-screen bg-no-repeat bg-cover bg-center overflow-hidden" style={{ backgroundImage: posterImage ? `url('${posterImage}')` : `url('${blurhashImg}')` }}>
            <Helmet>
                <title>{name}</title>
            </Helmet>

            <main className="content"><Outlet /></main>

            <footer className="footer px-4 py-4 border-t bg-base-200 text-base-content border-base-300 w-full bottom-0">
                <nav className="pl-4">
                    <div className="grid grid-flow-col gap-4">
                        <OptionalSocialLink icon={<TbWorldWww size={iconSize} />} url={socials?.mainWebsite} tooltip="Website" />
                        <OptionalSocialLink icon={<MdEmail size={iconSize} />} url={socials?.email ? `mailto:${socials?.email}`: ''} tooltip="E-Mail" />
                        <OptionalSocialLink icon={<FaInstagram size={iconSize} />} url={socials?.instagram} tooltip="Instagram" />
                        <OptionalSocialLink icon={<FaYoutube size={iconSize} />} url={socials?.youtube} tooltip="Youtube" />
                        <OptionalSocialLink icon={<FaXTwitter size={iconSize} />} url={socials?.x_twitter} tooltip="X (Twitter)" />
                        <OptionalSocialLink icon={<FaTiktok size={iconSize} />} url={socials?.tiktok} tooltip="Tiktok" />
                    </div>
                </nav>
                <aside className="place-self-center justify-self-end items-center grid-flow-col">
                    <p>Powered by <a href='https://github.com/Vin-Ren/Invetixia' target="_blank" className="link">Invetixia</a></p>
                    <FaSlackHash size={iconSize} />
                </aside>
            </footer>
        </div>
    )
}