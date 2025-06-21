import {
    ComponentType,
    FunctionComponent,
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { observer } from "mobx-react-lite";

import { RootStore, rootStore } from "./root-store";

// Create context
const StoreContext = createContext<RootStore | null>(null);

// Provider component
interface StoreProviderProps {
    children: ReactNode;
    store?: RootStore;
    loadingComponent?: ReactNode;
    errorComponent?: (error: string, retry: () => void) => ReactNode;
}

export function StoreProvider({
    children,
    store = rootStore,
    loadingComponent,
    errorComponent,
}: StoreProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [initializationError, setInitializationError] = useState<string | null>(null);

    async function initializeStores() {
        if (isInitialized || isInitializing) return;

        setIsInitializing(true);
        setInitializationError(null);

        try {
            await store.initializeFromDatabase();
            setIsInitialized(true);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to initialize stores";
            setInitializationError(errorMessage);
            console.error("Store initialization failed:", error);
        } finally {
            setIsInitializing(false);
        }
    }

    useEffect(() => {
        initializeStores();
    }, []);

    function handleRetry() {
        setIsInitialized(false);
        setIsInitializing(false);
        setInitializationError(null);
        initializeStores();
    }

    // Show loading state
    if (isInitializing) {
        return (
            <StoreContext.Provider value={store}>
                {loadingComponent || <DefaultLoadingComponent />}
            </StoreContext.Provider>
        );
    }

    // Show error state
    if (initializationError) {
        return (
            <StoreContext.Provider value={store}>
                {errorComponent ? (
                    errorComponent(initializationError, handleRetry)
                ) : (
                    <DefaultErrorComponent
                        error={initializationError}
                        onRetry={handleRetry}
                    />
                )}
            </StoreContext.Provider>
        );
    }

    // Show app when initialized
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

// Default loading component
function DefaultLoadingComponent() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                flexDirection: "column",
                gap: "1rem",
            }}
        >
            <div>Loading...</div>
            <div style={{ fontSize: "0.875rem", color: "#666" }}>Initializing data stores...</div>
        </div>
    );
}

// Default error component
interface DefaultErrorComponentProps {
    error: string;
    onRetry: () => void;
}

function DefaultErrorComponent({ error, onRetry }: DefaultErrorComponentProps) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                flexDirection: "column",
                gap: "1rem",
                padding: "2rem",
            }}
        >
            <div style={{ color: "#ef4444", fontWeight: "bold" }}>Initialization Error</div>
            <div style={{ fontSize: "0.875rem", color: "#666", textAlign: "center" }}>{error}</div>
            <button
                onClick={onRetry}
                style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                }}
            >
                Retry
            </button>
        </div>
    );
}

// Hook to use the store
export function useStore(): RootStore {
    const store = useContext(StoreContext);
    if (!store) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return store;
}

// Individual store hooks for convenience
export function useMessageStore() {
    const { messageStore } = useStore();
    return messageStore;
}

export function useConversationStore() {
    const { conversationStore } = useStore();
    return conversationStore;
}

export function useMemberStore() {
    const { memberStore } = useStore();
    return memberStore;
}

export function useUserStore() {
    const { userStore } = useStore();
    return userStore;
}

// Higher-order component for making components reactive to MobX changes
export function withStore<P extends object>(Component: ComponentType<P>): ComponentType<P> {
    return observer(Component as FunctionComponent<P>);
}
