import { makeAutoObservable } from "mobx";

import { ConversationStore } from "./conversation-store";
import { MemberStore } from "./member-store";
import { MessageStore } from "./message-store";
import { UserStore } from "./user-store";

export class RootStore {
    messageStore: MessageStore;
    conversationStore: ConversationStore;
    memberStore: MemberStore;
    userStore: UserStore;

    constructor() {
        this.messageStore = new MessageStore();
        this.conversationStore = new ConversationStore();
        this.memberStore = new MemberStore();
        this.userStore = new UserStore();

        makeAutoObservable(this);
    }

    // Cross-store computed values and actions

    // Get user details for a given user ID
    getUserById(userId: string) {
        return this.userStore.getUser(userId);
    }

    // Get conversation details for a given conversation ID
    getConversationById(conversationId: string) {
        return this.conversationStore.getConversation(conversationId);
    }

    // Clear all stores (for logout)
    async clearAll() {
        await Promise.all([
            this.messageStore.clearAll(),
            this.conversationStore.clearAll(),
            this.memberStore.clearAll(),
            this.userStore.clearAll(),
        ]);
    }

    // Get all errors from stores
    get errors() {
        return [
            this.messageStore.error,
            this.conversationStore.error,
            this.memberStore.error,
            this.userStore.error,
        ].filter((error) => error !== null);
    }

    // Check if there are any errors
    get hasErrors() {
        return this.errors.length > 0;
    }

    // Initialize all stores from IndexedDB
    async initializeFromDatabase(): Promise<void> {
        try {
            // Load all data in parallel
            await Promise.all([
                this.userStore.loadFromDatabase(),
                this.conversationStore.loadFromDatabase(),
                this.memberStore.loadFromDatabase(),
                this.messageStore.loadFromDatabase(),
            ]);
        } catch (error) {
            console.error("Failed to initialize stores from database:", error);
        }
    }

    // Clear all data from stores and database
    async clearAllData(): Promise<void> {
        try {
            // Clear stores
            this.clearAll();

            // Clear database
            const { db } = await import("@/sync/database");
            await db.transaction(
                "rw",
                [db.messages, db.conversations, db.members, db.users],
                async () => {
                    await db.messages.clear();
                    await db.conversations.clear();
                    await db.members.clear();
                    await db.users.clear();
                }
            );
        } catch (error) {
            console.error("Failed to clear all data:", error);
        }
    }
}

// Create a singleton instance
export const rootStore = new RootStore();
