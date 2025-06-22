import { makeAutoObservable, runInAction, toJS } from "mobx";
import { computedFn } from "mobx-utils";

import { ConversationSchema } from "@/api";
import { db } from "@/sync/database";

export class ConversationStore {
    conversations = new Map<string, ConversationSchema>();
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    // Actions
    private setConversations(conversations: ConversationSchema[]) {
        runInAction(() => {
            this.conversations.clear();
            conversations.forEach((conversation) => {
                this.conversations.set(conversation.id, conversation);
            });
        });
    }

    private setLoading(loading: boolean) {
        runInAction(() => {
            this.isLoading = loading;
        });
    }

    private setError(error: string | null) {
        runInAction(() => {
            this.error = error;
        });
    }

    // Computed getters
    get allConversations(): ConversationSchema[] {
        return Array.from(this.conversations.values());
    }

    get sortedConversations(): ConversationSchema[] {
        return this.allConversations.sort(
            (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
        );
    }

    getConversation(conversationId: string): ConversationSchema | undefined {
        return this.conversations.get(conversationId);
    }

    // Memoized search for better performance
    searchConversations = computedFn((query: string): ConversationSchema[] => {
        if (!query.trim()) return this.sortedConversations;

        const lowerQuery = query.toLowerCase();
        return this.allConversations
            .filter((conversation) => conversation.title.toLowerCase().includes(lowerQuery))
            .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    });

    get recentConversations(): ConversationSchema[] {
        return this.sortedConversations.slice(0, 10);
    }

    // Database persistence methods
    async loadFromDatabase(): Promise<void> {
        try {
            this.setLoading(true);
            const conversations = await db.conversations.toArray();
            this.setConversations(conversations as ConversationSchema[]);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to load conversations");
        } finally {
            this.setLoading(false);
        }
    }

    async save(conversation: ConversationSchema): Promise<void> {
        try {
            await db.conversations.put(toJS(conversation));

            runInAction(() => {
                const existing = this.conversations.get(conversation.id);

                this.conversations.set(conversation.id, { ...existing, ...conversation });
            });
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to save conversation");
        }
    }

    async clearAll(): Promise<void> {
        await db.conversations.clear();

        runInAction(() => {
            this.conversations.clear();
        });
    }
}
