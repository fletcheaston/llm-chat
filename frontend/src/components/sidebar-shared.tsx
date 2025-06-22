import { useLocation } from "@tanstack/react-router";

import { ConversationSidebar } from "@/components/conversation-sidebar";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { Sidebar, SidebarContent, SidebarGroup } from "@/ui/sidebar";

import { SidebarButtons } from "./sidebar-buttons";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";

export function SidebarShared() {
    /**************************************************************************/
    /* State */
    const pathname = useLocation({ select: (state) => state.pathname });

    /**************************************************************************/
    /* Render */
    return (
        <>
            <SidebarButtons />

            <Sidebar collapsible="offcanvas">
                <SidebarHeader />

                <SidebarContent>
                    <SidebarGroup>
                        {pathname.startsWith("/settings") ? (
                            <SettingsSidebar />
                        ) : (
                            <ConversationSidebar />
                        )}
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter />
            </Sidebar>
        </>
    );
}
