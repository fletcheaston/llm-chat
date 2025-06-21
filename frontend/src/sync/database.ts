import Dexie, { type EntityTable } from "dexie";

import {
    GlobalSyncTypesResponses,
    SyncConversation,
    SyncMember,
    SyncMessage,
    SyncUser,
} from "@/api";

export type SyncData = GlobalSyncTypesResponses["200"];

const db = new Dexie("F3Chat") as Dexie & {
    messages: EntityTable<SyncMessage["data"], "id">;
    conversations: EntityTable<SyncConversation["data"], "id">;
    members: EntityTable<SyncMember["data"], "id">;
    users: EntityTable<SyncUser["data"], "id">;
};

db.version(1).stores({
    messages: "id,conversationId,replyToId,authorId,created",
    conversations: "id,created",
    members: "id,conversationId,userId,[conversationId+userId],created",
    users: "id,created",
});

export { db };
