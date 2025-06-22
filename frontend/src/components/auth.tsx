import { ReactNode, createContext, useCallback, useContext, useState } from "react";

import { useMountEffect } from "@react-hookz/web";
import { toast } from "sonner";

import { SettingSchema, UserSchema, updateMySettings, whoAmI } from "@/api/client";
import { client } from "@/api/client/client.gen";

const UserContext = createContext<UserSchema | null>(null);
const SettingsContext = createContext<SettingSchema | null>(null);
const UpdateSettingsContext = createContext<
    (<K extends keyof SettingKey>(key: K, value: SettingSchema[K]) => void) | null
>(null);

type SettingKey = Omit<SettingSchema, "id" | "created" | "modified">;

export function AuthProvider(props: { children: ReactNode }) {
    /**************************************************************************/
    /* State */
    const [user, setUser] = useState<UserSchema | undefined | null>(undefined);
    const [settings, setSettings] = useState<SettingSchema | undefined | null>(undefined);

    const updateSetting = useCallback(
        <K extends keyof SettingKey>(key: K, value: SettingSchema[K]) => {
            // Optimistic update to state
            setSettings((prevState) => {
                if (!prevState) return prevState;
                return {
                    ...prevState,
                    [key]: value,
                };
            });

            // Sync to API and update local state again when it goes through
            updateMySettings({
                body: {
                    [key]: value,
                },
            })
                .then((result) => {
                    if (!result.data) return;

                    setSettings(result.data);

                    toast.success("Settings updated.");
                })
                .catch(() => {
                    toast.error("Unable to update settings remotely.", { duration: 3000 });
                });
        },
        [setSettings]
    );

    useMountEffect(async () => {
        try {
            const result = await whoAmI();

            if (!result.data) {
                throw new Error("Unauthenticated user.");
            }

            setUser(result.data.user);
            setSettings(result.data.settings);

            client.setConfig({
                headers: {
                    "X-CSRFToken": result.data.csrfToken,
                },
            });
        } catch {
            setUser(null);
            setSettings(null);
        }
    });

    /**************************************************************************/
    /* Render */
    if (user === undefined) return null;
    if (settings === undefined) return null;

    return (
        <UserContext.Provider value={user}>
            <SettingsContext.Provider value={settings}>
                <UpdateSettingsContext.Provider value={updateSetting}>
                    {props.children}
                </UpdateSettingsContext.Provider>
            </SettingsContext.Provider>
        </UserContext.Provider>
    );
}

export function useAnonUser() {
    return useContext(UserContext);
}

export function useUser() {
    const user = useAnonUser();

    if (user === null) {
        throw new Error("Unauthenticated user.");
    }

    return user;
}

export function useSettings() {
    const value = useContext(SettingsContext);

    if (value === null) {
        throw new Error("Missing context provider.");
    }

    return value;
}

export function useUpdateSetting() {
    const value = useContext(UpdateSettingsContext);

    if (value === null) {
        throw new Error("Missing context provider.");
    }

    return value;
}
