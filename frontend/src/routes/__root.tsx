import { HeadContent, Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router";
import { Toaster } from "sonner";

import { UserSchema } from "@/api";
import { useAnonUser } from "@/components/auth";
import { SidebarShared } from "@/components/sidebar-shared";
import { useTheme } from "@/components/themes";
import sonnerCss from "@/sonner.css?url";
import appCss from "@/styles.css?url";
import { StoreProvider } from "@/sync/stores";
import { SyncProvider } from "@/sync/sync-provider";
import { SidebarProvider } from "@/ui/sidebar";

interface RouterContext {
    user: UserSchema | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    beforeLoad: async ({ context, location }): Promise<undefined> => {
        const { user } = context;
        const isLoginPage = location.pathname === "/login";

        // If the user isn't authenticated, take them to the login page
        if (user === null) {
            // Already on the login page
            if (isLoginPage) return;

            throw redirect({ to: "/login" });
        }

        // Authenticated user
        // If they're on the login page, take them to home page
        if (isLoginPage) {
            throw redirect({ to: "/chat" });
        }
    },
    head: () => {
        return {
            meta: [
                { title: "Fletcher Easton's T3 Chat Clone" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1.0",
                },
            ],
            links: [
                {
                    rel: "icon",
                    href: "/favicon.ico",
                },
                {
                    rel: "stylesheet",
                    href: appCss,
                },
                {
                    rel: "stylesheet",
                    href: sonnerCss,
                },
            ],
        };
    },
    component: RouteComponent,
});

function Authenticated() {
    /**************************************************************************/
    /* Effects */
    useTheme();

    /**************************************************************************/
    /* Render */
    return (
        <StoreProvider>
            <SyncProvider>
                <SidebarProvider>
                    <SidebarProvider>
                        <div className="relative">
                            <SidebarShared />
                        </div>

                        <Outlet />
                    </SidebarProvider>
                </SidebarProvider>
            </SyncProvider>
        </StoreProvider>
    );
}

function Anonymous() {
    /**************************************************************************/
    /* Render */
    return <Outlet />;
}

function RouteComponent() {
    /**************************************************************************/
    /* State */
    const user = useAnonUser();

    /**************************************************************************/
    /* Render */
    return (
        <>
            <head>
                <HeadContent />
            </head>

            <body className="h-full overflow-y-auto overscroll-none">
                <main>
                    {user === null ? <Anonymous /> : <Authenticated />}

                    <Toaster
                        expand
                        richColors
                        duration={1500}
                        position="top-right"
                    />
                </main>
            </body>
        </>
    );
}
