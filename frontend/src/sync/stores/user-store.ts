import { makeAutoObservable, runInAction, toJS } from "mobx";

import { UserSchema } from "@/api";
import { db } from "@/sync/database";

export class UserStore {
    users = new Map<string, UserSchema>();
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    // Actions
    private setUsers(users: UserSchema[]) {
        runInAction(() => {
            this.users.clear();
            users.forEach((user) => {
                this.users.set(user.id, user);
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
    get allUsers(): UserSchema[] {
        return Array.from(this.users.values());
    }

    get sortedUsers(): UserSchema[] {
        return this.allUsers.sort((a, b) => a.name.localeCompare(b.name));
    }

    getUser(userId: string): UserSchema | undefined {
        return this.users.get(userId);
    }

    searchUsers(query: string): UserSchema[] {
        if (!query.trim()) return this.sortedUsers;

        const lowerQuery = query.toLowerCase();
        return this.allUsers
            .filter((user) => user.name.toLowerCase().includes(lowerQuery))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    // Database persistence methods
    async loadFromDatabase(): Promise<void> {
        try {
            this.setLoading(true);
            const users = await db.users.toArray();
            this.setUsers(users as UserSchema[]);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to load users");
        } finally {
            this.setLoading(false);
        }
    }

    async save(user: UserSchema): Promise<void> {
        try {
            await db.users.put(toJS(user));

            runInAction(() => {
                const existing = this.users.get(user.id);

                this.users.set(user.id, { ...existing, ...user });
            });
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to save user");
        }
    }

    async clearAll(): Promise<void> {
        await db.users.clear();

        runInAction(() => {
            this.users.clear();
        });
    }
}
