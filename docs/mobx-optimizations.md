# MobX Performance Optimizations

This document outlines the performance optimizations implemented in the MobX stores to improve application performance.

## Optimizations Implemented

### 1. Memoized Computations with `computedFn`

The following expensive methods have been converted to use `computedFn` for automatic memoization:

#### RootStore

- **`getMyConversation`**: Memoizes conversation + member data combination
- **`getMessageTree`**: Caches expensive recursive tree building operations
- **`getConversationsForUser`**: Memoizes user conversation list with member data
- **`getDailyLLMResponseCount`**: Caches daily message count calculations

#### ConversationStore

- **`searchConversations`**: Memoizes search results for better search performance

#### UserStore

- **`searchUsers`**: Memoizes user search results

#### MessageStore

- **`getMessagesByConversationId`**: Memoizes message filtering by conversation

### 2. Benefits of These Optimizations

- **Reduced Computations**: Expensive operations are cached and only recomputed when dependencies change
- **Better Performance**: UI updates are faster as cached results are returned for repeated calls
- **Automatic Cache Invalidation**: MobX automatically invalidates caches when underlying data changes
- **Memory Efficient**: `computedFn` only caches recent results, preventing memory leaks

### 3. Usage Guidelines

#### Use Specialized Store Hooks

Instead of `useStore()`, prefer specific store hooks for better selective observation:

```typescript
// ❌ Less optimal - observes entire root store
const store = useStore();
const messages = store.getMessagesByConversationId(conversationId);

// ✅ Better - only observes message store
const messageStore = useMessageStore();
const messages = messageStore.getMessagesByConversationId(conversationId);
```

#### Leverage Memoized Methods

The optimized methods now cache results automatically:

```typescript
// These calls are now memoized and fast on repeat calls
const messageTree = store.getMessageTree(conversationId);
const myConversation = store.getMyConversation(conversationId, userId);
const searchResults = conversationStore.searchConversations(query);
```

## Performance Impact

### Before Optimizations

- Message tree rebuilding on every render
- Search operations creating new arrays on every call
- Cross-store computations recalculating repeatedly
- Components re-rendering due to broad store observation

### After Optimizations

- Message trees cached until underlying messages change
- Search results cached by query
- Cross-store computations memoized
- Potential for more selective component observation

## Monitoring Performance

To monitor the effectiveness of these optimizations:

1. Use React DevTools Profiler to measure component render times
2. Monitor MobX computations using the MobX DevTools
3. Check for unnecessary re-renders with the `trace()` utility from MobX

## Future Optimization Opportunities

1. **View Model Pattern**: Create specialized view models for complex UI state
2. **Structural Sharing**: Implement more sophisticated caching for large data sets
3. **Lazy Loading**: Implement lazy loading for conversations and messages
4. **Virtual Scrolling**: For large message lists and conversation lists
