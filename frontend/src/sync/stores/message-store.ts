import { makeAutoObservable, runInAction } from "mobx";

import { LargeLanguageModel, MessageSchema } from "@/api";
import { db } from "@/sync/database";

export class MessageStore {
    messages = new Map<string, MessageSchema>();
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    // Actions
    setMessages(messages: MessageSchema[]) {
        runInAction(() => {
            this.messages.clear();
            messages.forEach((message) => {
                this.messages.set(message.id, message);
            });
        });
    }

    addMessage(message: MessageSchema) {
        runInAction(() => {
            this.messages.set(message.id, message);
        });
    }

    updateMessage(messageId: string, updates: Partial<MessageSchema>) {
        runInAction(() => {
            const existing = this.messages.get(messageId);
            if (existing) {
                this.messages.set(messageId, { ...existing, ...updates });
            }
        });
    }

    removeMessage(messageId: string) {
        runInAction(() => {
            this.messages.delete(messageId);
        });
    }

    setLoading(loading: boolean) {
        runInAction(() => {
            this.isLoading = loading;
        });
    }

    setError(error: string | null) {
        runInAction(() => {
            this.error = error;
        });
    }

    // Computed getters
    get allMessages(): MessageSchema[] {
        return Array.from(this.messages.values());
    }

    get messagesByConversation() {
        const grouped = new Map<string, MessageSchema[]>();
        this.messages.forEach((message) => {
            const conversationId = message.conversationId;
            if (!grouped.has(conversationId)) {
                grouped.set(conversationId, []);
            }
            grouped.get(conversationId)!.push(message);
        });

        // Sort messages by creation date within each conversation
        grouped.forEach((messages) => {
            messages.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
        });

        return grouped;
    }

    getMessagesByConversationId(conversationId: string): MessageSchema[] {
        return this.messagesByConversation.get(conversationId) || [];
    }

    getMessage(messageId: string): MessageSchema | undefined {
        return this.messages.get(messageId);
    }

    getMessagesByAuthor(authorId: string): MessageSchema[] {
        return this.allMessages.filter((message) => message.authorId === authorId);
    }

    getMessagesByLLM(llm: LargeLanguageModel): MessageSchema[] {
        return this.allMessages.filter((message) => message.llm === llm);
    }

    getReplies(messageId: string): MessageSchema[] {
        return this.allMessages.filter((message) => message.replyToId === messageId);
    }

    get completedLLMMessages(): MessageSchema[] {
        return this.allMessages.filter((message) => message.llm && message.llmCompleted);
    }

    get pendingLLMMessages(): MessageSchema[] {
        return this.allMessages.filter((message) => message.llm && !message.llmCompleted);
    }

    // Database persistence methods
    async loadFromDatabase(): Promise<void> {
        try {
            this.setLoading(true);
            const messages = await db.messages.toArray();
            this.setMessages(messages as MessageSchema[]);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to load messages");
        } finally {
            this.setLoading(false);
        }
    }

    async saveToDatabase(message: MessageSchema): Promise<void> {
        try {
            await db.messages.put(message);
            this.addMessage(message);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to save message");
        }
    }

    async saveAllToDatabase(): Promise<void> {
        try {
            const messages = Array.from(this.messages.values());
            await db.messages.bulkPut(messages);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to save messages");
        }
    }

    async deleteFromDatabase(messageId: string): Promise<void> {
        try {
            await db.messages.delete(messageId);
            this.removeMessage(messageId);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to delete message");
        }
    }
}
