import { ReactNode, useEffect, useRef } from "react";

import { useIntervalEffect } from "@react-hookz/web";
import ReconnectingWebSocket from "reconnecting-websocket";

import { globalSyncBootstrap } from "@/api";
import { useAnonUser } from "@/components/auth";
import { rootStore } from "@/sync/stores";

import { SyncData } from "./database";

async function addToStore(data: SyncData) {
    switch (data.type) {
        case "conversation":
            await rootStore.conversationStore.save(data.data);
            return;

        case "message":
            await rootStore.messageStore.save(data.data);
            return;

        case "member":
            await rootStore.memberStore.save(data.data);
            return;

        case "user":
            await rootStore.userStore.save(data.data);
            return;

        default:
            return data satisfies never;
    }
}

export function SyncProvider(props: { children: ReactNode }) {
    /**************************************************************************/
    /* State */
    const user = useAnonUser();

    const wsRef = useRef<ReconnectingWebSocket>(null);

    useEffect(() => {
        if (!user) return;

        wsRef.current = new ReconnectingWebSocket(`${window.location.origin}/ws/sync`, [], {
            connectionTimeout: 1000, // retry connect if not connected after this time, in ms
        });

        wsRef.current.addEventListener("message", (event) => {
            const data = JSON.parse(event.data) as SyncData;

            // Save data locally
            addToStore(data);
        });

        return () => wsRef.current?.close();
    }, [user]);

    // On startup, full bootstrap
    useEffect(() => {
        if (!user) return;

        // Set timestamp for next bootstrap
        localStorage.setItem("bootstrap-timestamp", new Date().toISOString());

        globalSyncBootstrap().then(({ data }) => {
            if (!data) {
                throw new Error("Unable to bootstrap");
            }

            // Save data locally
            data.forEach((value) => {
                addToStore(value);
            });
        });
    }, [user]);

    // In case the WebSocket connection fails, sync data periodically
    useIntervalEffect(() => {
        // Pull the latest timestamp from local storage
        const bootstrapTimestamp = localStorage.getItem("bootstrap-timestamp");

        // Set timestamp for next bootstrap
        localStorage.setItem("bootstrap-timestamp", new Date().toISOString());

        globalSyncBootstrap({ query: { timestamp: bootstrapTimestamp } }).then(({ data }) => {
            if (!data) {
                throw new Error("Unable to bootstrap");
            }

            // Save data locally
            data.forEach((value) => {
                addToStore(value);
            });
        });
    }, 10000);

    /**************************************************************************/
    /* Render */
    return <>{props.children}</>;
}
