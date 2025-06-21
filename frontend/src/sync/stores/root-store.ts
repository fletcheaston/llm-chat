import { makeAutoObservable } from "mobx";
import { toast } from "sonner";

import {
    ConversationSchema,
    LargeLanguageModel,
    MemberSchema,
    MessageSchema,
    UserSchema,
    createConversation as apiCreateConversation,
    createMessage as apiCreateMessage,
    updateConversation as apiUpdateConversation,
} from "@/api";

import { ConversationStore } from "./conversation-store";
import { MemberStore } from "./member-store";
import { MessageStore } from "./message-store";
import { UserStore } from "./user-store";

export interface MessageTreeSchema {
    message: MessageSchema;
    replies: MessageTreeSchema[];
}

export interface CustomizedConversationSchema extends ConversationSchema {
    llms: Array<LargeLanguageModel>;
    messageBranches: MemberSchema["messageBranches"];
}

export interface ConversationWithMemberData extends ConversationSchema {
    hidden: boolean;
    llmsSelected: MemberSchema["llmsSelected"];
}

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

    /**************************************************************************/
    /* Cross-store computed values and actions */

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

    /**************************************************************************/

    /* Conversation-specific computed values */
    getMyConversation(
        conversationId: string,
        userId: string
    ): CustomizedConversationSchema | undefined {
        const conversation = this.conversationStore.getConversation(conversationId);
        const member = this.memberStore.getMemberByUserAndConversation(userId, conversationId);

        if (!conversation || !member) {
            return undefined;
        }

        return {
            ...conversation,
            llms: member.llmsSelected,
            messageBranches: member.messageBranches,
        };
    }

    getMessageTree(conversationId: string): MessageTreeSchema[] {
        const messages = this.messageStore.getMessagesByConversationId(conversationId);

        // Build the tree structure
        function buildTree(message: MessageSchema): MessageTreeSchema {
            const replies = messages
                .filter((msg) => msg.replyToId === message.id)
                .map((msg) => buildTree(msg));

            return {
                message,
                replies,
            };
        }

        // Build the tree from our root messages
        return messages
            .filter((msg) => msg.replyToId === null)
            .map((rootMessage) => buildTree(rootMessage));
    }

    getUserMapForConversation(conversationId: string): Record<string, UserSchema> {
        const members = this.memberStore.getMembersByConversationId(conversationId);
        const userIds = members.map((member) => member.userId);

        const userMap: Record<string, UserSchema> = {};
        userIds.forEach((userId) => {
            const user = this.userStore.getUser(userId);
            if (user) {
                userMap[userId] = user;
            }
        });

        return userMap;
    }

    /**************************************************************************/

    /* Helper functions for data operations */
    async createConversation(
        userId: string,
        content: string,
        llms: Array<LargeLanguageModel>,
        onOptimisticSave: ((id: string) => Promise<void>) | null
    ) {
        // 1. Optimistically update local stores
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

        // Save to stores (which handle database persistence)
        await Promise.all([
            this.conversationStore.save(conversation),
            this.memberStore.save(member),
            this.messageStore.save(message),
        ]);

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
        // 1. Optimistically update local stores
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

        // Save message to store
        await this.messageStore.save(message);

        // Update member message branches
        const member = this.memberStore.getMemberByUserAndConversation(
            props.userId,
            props.conversationId
        );

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

        await this.memberStore.save({
            ...member,
            messageBranches,
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
        // 1. Optimistically update local store
        const member = this.memberStore.getMemberByUserAndConversation(
            props.userId,
            props.conversationId
        );

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        const messageBranches = { ...member.messageBranches };

        props.hiddenMessageIds.forEach((id) => {
            messageBranches[id] = false;
        });

        if (props.shownMessageId) {
            messageBranches[props.shownMessageId] = true;
        }

        await this.memberStore.save({
            ...member,
            messageBranches,
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
        // 1. Optimistically update local store
        const member = this.memberStore.getMemberByUserAndConversation(userId, conversationId);

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        await this.memberStore.save({
            ...member,
            hidden: true,
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
        // 1. Optimistically update local store
        const member = this.memberStore.getMemberByUserAndConversation(userId, conversationId);

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        await this.memberStore.save({
            ...member,
            hidden: false,
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
        // 1. Optimistically update local store
        const member = this.memberStore.getMemberByUserAndConversation(userId, conversationId);

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        await this.memberStore.save({
            ...member,
            llmsSelected: llms,
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                llmsSelected: llms,
            },
            path: { conversation_id: conversationId },
        });
    }

    /**************************************************************************/

    /* Additional helper methods for components */

    getMessagesByConversationId(conversationId: string): MessageSchema[] {
        return this.messageStore.getMessagesByConversationId(conversationId);
    }

    getUserMessageCounts(conversationId: string): Record<string, number> {
        const messages = this.getMessagesByConversationId(conversationId);
        const userMap = this.getUserMapForConversation(conversationId);

        return Object.fromEntries(
            Object.keys(userMap).map((userId) => [
                userId,
                messages.filter((msg) => msg.authorId === userId).length,
            ])
        );
    }

    getLLMMessageCounts(conversationId: string): Record<string, number> {
        const messages = this.getMessagesByConversationId(conversationId);
        const llmCounts: Record<string, number> = {};

        messages.forEach((msg) => {
            if (msg.llm) {
                llmCounts[msg.llm] = (llmCounts[msg.llm] || 0) + 1;
            }
        });

        return llmCounts;
    }

    getConversationsForUser(userId: string): ConversationWithMemberData[] {
        const conversations = this.conversationStore.sortedConversations;
        const userMembers = this.memberStore.getMembersByUserId(userId);

        const memberMap = Object.fromEntries(
            userMembers.map((member) => [member.conversationId, member])
        );

        return conversations.map((conversation) => {
            const member = memberMap[conversation.id];
            return {
                ...conversation,
                hidden: member?.hidden || false,
                llmsSelected: member?.llmsSelected || [],
            };
        });
    }
}

// Create a singleton instance
export const rootStore = new RootStore();
