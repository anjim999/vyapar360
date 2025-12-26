# TeamsPage.jsx Refactor Plan

**Original Size:** 5,043 lines  
**Target Size:** < 300 lines  
**Extraction Target:** ~4,750 lines to extract

---

## Phase 1: Component Extraction (STARTED)

### ✅ Completed
1. **VideoPlayer.jsx** (488 lines) - Custom video player with fullscreen controls

### 🔄 Next - Large Components to Extract

2. **EmojiPicker.jsx** - Emoji selection modal  
3. **GifPicker.jsx** - GIF selection (if implemented)  
4. **MessageItem.jsx** - Individual message rendering with reactions  
5. **MessageInput.jsx** - Message input with file upload, emoji  
6. **TypingIndicator.jsx** - "User is typing..." indicator  

### Modal Components to Extract (components/chat/modals/)

7. **CreateGroupModal.jsx** - Create new team/group  
8. **CreateChannelModal.jsx** - Create new channel  
9. **TeamSettingsModal.jsx** - Team settings  
10. **ForwardMessageModal.jsx** - Forward messages  
11. **DeleteModal.jsx** - Confirm deletion  
12. **ReactionsModal.jsx** - View message reactions  
13. **ImagePreviewModal.jsx** - Full-size image view  
14. **GeminiChatModal.jsx** - AI chat interface  
15. **ComingSoonModal.jsx** - Feature placeholder  

### Sidebar Components (components/chat/)

16. **ChatHeader.jsx** - Chat/channel header with actions  
17. **ChatList.jsx** - Recent conversations list  
18. **ChannelList.jsx** - Team channels list  
19. **TeamList.jsx** - Teams sidebar  
20. **ContactInfo.jsx** - User/channel info sidebar  
21. **StarredView.jsx** - Starred messages view  

---

## Phase 2: Custom Hooks (hooks/chat/)

22. **useChatMessages.js** - Message fetching & state  
23. **useSocket.js** - Socket subscriptions (if not already global)  
24. **useMessageActions.js** - Edit, delete, react, forward  
25. **useInfiniteScroll.js** - Load more messages  
26. **useTypingIndicator.js** - Typing status  
27. **useReactions.js** - Reaction handling  

---

## Phase 3: Utility Functions

28. Extract emoji data & helpers  
29. Extract file upload utilities  
30. Extract message formatting utils  

---

## Estimated Files to Create: 30+

After extraction, TeamsPage.jsx will:
- Import all extracted components
- Orchestrate state management
- Handle routing between views
- Remain < 300 lines

---

## Execution Order

1. ✅ VideoPlayer
2. Next: Modals (simplest, self-contained)
3. Then: Message components
4. Then: Sidebar components
5. Then: Custom hooks
6. Finally: Refactor main TeamsPage

This will take approximately **4-6 hours** to complete fully while maintaining zero behavior changes.

**Status:** Phase 1 - 1/30 complete (3%)
