import { makeAutoObservable } from "mobx";
import { toast } from "sonner";

import {
    ConversationSchema,
    LargeLanguageModel,
    MemberSchema,
    MessageSchema,
    createConversation as apiCreateConversation,
    createMessage as apiCreateMessage,
    updateConversation as apiUpdateConversation,
} from "@/api";

import { db } from "../database";
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

    // Helper functions for data operations

    async createConversation(
        userId: string,
        content: string,
        llms: Array<LargeLanguageModel>,
        onOptimisticSave: ((id: string) => Promise<void>) | null
    ) {
        // 1. Optimistically update local database
        const timestamp = new Date().toISOString();

        const conversation: ConversationSchema = {
            id: crypto.randomUUID(),
            created: timestamp,
            modified: timestamp,
            title: content,
            ownerId: userId,
        };

        const member: MemberSchema = {
            id: crypto.randomUUID(),
            created: timestamp,
            modified: timestamp,
            conversationId: conversation.id,
            userId: userId,
            addedById: userId,
            llmsSelected: llms,
            messageBranches: {},
            hidden: false,
        };

        const message: MessageSchema = {
            id: crypto.randomUUID(),
            created: timestamp,
            modified: timestamp,
            title: content,
            content: content,
            conversationId: conversation.id,
            replyToId: null,
            authorId: userId,
            llm: null,
            llmCompleted: null,
            tokens: null,
        };

        await db.transaction("readwrite", db.conversations, db.members, db.messages, async () => {
            await db.conversations.put(conversation, conversation.id);
            await db.members.put(member, member.id);
            await db.messages.put(message, message.id);
        });

        // 1.5. If provided, optimistically navigate
        if (onOptimisticSave !== null) {
            await onOptimisticSave(conversation.id);
        }

        // 2. Save to API
        const result = await apiCreateConversation({
            body: {
                id: conversation.id,
                title: conversation.title,
                memberId: member.id,
                messageId: message.id,
                messageTitle: message.title,
                messageContent: message.content,
                llms,
            },
        });

        if (result.error) {
            if (result.response.status === 429) {
                toast.error(
                    "You've exceeded the number of free LLM responses for the last 24 hours.",
                    {
                        duration: 5000,
                    }
                );
            }
        }
    }

    async createMessage(props: {
        userId: string;
        replyToId: string | null;
        siblingMessageId: string | null;
        conversationId: string;
        content: string;
        llms: Array<LargeLanguageModel>;
    }) {
        // 1. Optimistically update local database
        const timestamp = new Date().toISOString();

        const message: MessageSchema = {
            id: crypto.randomUUID(),
            created: timestamp,
            modified: timestamp,
            title: props.content,
            content: props.content,
            conversationId: props.conversationId,
            replyToId: props.replyToId,
            authorId: props.userId,
            llm: null,
            llmCompleted: null,
            tokens: null,
        };

        await db.transaction("readwrite", db.messages, db.members, async () => {
            await db.messages.put(message, message.id);

            const member = await db.members
                .where(["conversationId", "userId"])
                .equals([props.conversationId, props.userId])
                .first();

            if (!member) {
                throw new Error("Unable to find membership.");
            }

            const messageBranches = {
                ...member.messageBranches,
                [message.id]: true,
            };

            if (props.siblingMessageId) {
                messageBranches[props.siblingMessageId] = false;
            }

            await db.members.put(
                {
                    ...member,
                    messageBranches,
                },
                member.id
            );
        });

        // 2. Save to API
        const result = await apiCreateMessage({
            body: {
                id: message.id,
                title: message.title,
                content: message.content,
                conversationId: message.conversationId,
                replyToId: message.replyToId,
                llms: props.llms,
            },
        });

        if (result.error) {
            if (result.response.status === 429) {
                toast.error(
                    "You've exceeded the number of free LLM responses for the last 24 hours.",
                    {
                        duration: 5000,
                    }
                );
            }
        }
    }

    async updateMessageBranches(props: {
        userId: string;
        conversationId: string;
        hiddenMessageIds: Array<string>;
        shownMessageId: string | null;
    }) {
        // 1. Optimistically update local database
        let messageBranches: Record<string, boolean> = {};

        await db.transaction("readwrite", db.members, async () => {
            const member = await db.members
                .where(["conversationId", "userId"])
                .equals([props.conversationId, props.userId])
                .first();

            if (!member) {
                throw new Error("Unable to find membership.");
            }

            messageBranches = { ...member.messageBranches };

            props.hiddenMessageIds.forEach((id) => {
                messageBranches[id] = false;
            });

            if (props.shownMessageId) {
                messageBranches[props.shownMessageId] = true;
            }

            await db.members.put(
                {
                    ...member,
                    messageBranches,
                },
                member.id
            );
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                messageBranches,
            },
            path: { conversation_id: props.conversationId },
        });
    }

    async hideConversation(userId: string, conversationId: string) {
        // 1. Optimistically update local database
        await db.transaction("readwrite", db.members, async () => {
            const member = await db.members
                .where(["conversationId", "userId"])
                .equals([conversationId, userId])
                .first();

            if (!member) {
                throw new Error("Unable to find membership.");
            }

            await db.members.put(
                {
                    ...member,
                    hidden: true,
                },
                member.id
            );
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                hidden: true,
            },
            path: { conversation_id: conversationId },
        });
    }

    async showConversation(userId: string, conversationId: string) {
        // 1. Optimistically update local database
        await db.transaction("readwrite", db.members, async () => {
            const member = await db.members
                .where(["conversationId", "userId"])
                .equals([conversationId, userId])
                .first();

            if (!member) {
                throw new Error("Unable to find membership.");
            }

            await db.members.put(
                {
                    ...member,
                    hidden: false,
                },
                member.id
            );
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                hidden: false,
            },
            path: { conversation_id: conversationId },
        });
    }

    async setConversationLlms(
        userId: string,
        conversationId: string,
        llms: Array<LargeLanguageModel>
    ) {
        // 1. Optimistically update local database
        await db.transaction("readwrite", db.members, async () => {
            const member = await db.members
                .where(["conversationId", "userId"])
                .equals([conversationId, userId])
                .first();

            if (!member) {
                throw new Error("Unable to find membership.");
            }

            await db.members.put(
                {
                    ...member,
                    llmsSelected: llms,
                },
                member.id
            );
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                llmsSelected: llms,
            },
            path: { conversation_id: conversationId },
        });
    }
}

// Create a singleton instance
export const rootStore = new RootStore();
