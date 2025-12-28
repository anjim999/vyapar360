# Teams Chat Notifications Implementation

## Overview
This document outlines the implementation of real-time notifications for the Teams chat module. The new features include:
1.  **Global Desktop/Toast Notifications**: Notifications appear even when the user is navigating other parts of the ERP.
2.  **Sidebar Badge**: A real-time unread message counter on the "Teams Chat" sidebar item.
3.  **Floating Chat Window**: A quick-reply interface that opens from notifications, allowing users to reply without leaving their current page.
4.  **Sound Alerts**: Audio feedback for incoming messages.

## Components Created

### 1. `TeamsNotificationContext.jsx` (`/erp/frontend/src/context/`)
-   **Purpose**: Manages the global state for Teams notifications, socket connection, and unread counts.
-   **Key Features**:
    -   Connects to `TEAMS_SOCKET_URL`.
    -   Listens for `channel:message` and `direct:message`.
    -   Manages `unreadCount` global state.
    -   Handles Web Notification API interaction.
    -   Plays notification sounds.
    -   Smartly suppresses notifications when the user is already on the `/teams` page.

### 2. `TeamsNotificationToast.jsx` (`/erp/frontend/src/components/teams/`)
-   **Purpose**: Displays a transient toast notification for new messages.
-   **Key Features**:
    -   Shows sender avatar, name, and message preview.
    -   "Reply" button opens the Floating Chat.
    -   "Open Teams" button navigates to the full Teams page.
    -   Auto-dismisses after 6 seconds.

### 3. `TeamsFloatingChat.jsx` (`/erp/frontend/src/components/teams/`)
-   **Purpose**: Provides a collaborative quick-reply window.
-   **Key Features**:
    -   Fetches recent message history for the specific conversation.
    -   Allows sending new messages (direct or channel).
    -   Updates in real-time (optimistically).
    -   Expandable to full view.

### 4. `TeamsNotificationWrapper.jsx` (`/erp/frontend/src/components/teams/`)
-   **Purpose**: Container component to render the Toast and Floating Chat at the application root level.

### 5. `teamsService.js` (`/erp/frontend/src/services/`)
-   **Purpose**: Centralized API service for Teams-related endpoints (messages, teams, channels).
-   **Used By**: `TeamsFloatingChat` and `TeamsPage`.

## Integration Points

-   **`main.jsx`**: Wrapped the application with `TeamsNotificationProvider` and added `TeamsNotificationWrapper`.
-   **`Sidebar.jsx`**: Consumes `useTeamsNotification` to display the unread badge count.
-   **`TeamsPage.jsx`**:
    -   Imports `useTeamsNotification` to call `clearUnreadCount()` on mount.
    -   Ensures the sidebar badge is reset when the user enters the Teams interface.

## Verification Steps

1.  **Start the Development Servers**:
    -   Ensure the Gateway, ERP Backend, and Teams Backend are running.
    -   Start the Frontend (`npm run dev`).

2.  **Test Incoming Notification**:
    -   Log in as User A in one browser/incognito window.
    -   Log in as User B in another.
    -   Navigate User A to a non-Teams page (e.g., Dashboard).
    -   From User B, send a message to User A.
    -   **Expectation**: User A sees a toast notification and hears a sound. The Sidebar "Teams Chat" item shows a generic badge count increment.

3.  **Test Floating Chat**:
    -   Click "Reply" on the toast notification.
    -   **Expectation**: A floating chat window opens with the conversation history.
    -   Send a reply from the floating chat.
    -   **Expectation**: User B receives the message.

4.  **Test Badge Logic**:
    -   Navigate User A to `/teams` page.
    -   **Expectation**: The Sidebar badge count clears (disappears or resets to 0/hidden).
    -   Receive a message while on `/teams` page.
    -   **Expectation**: No toast notification appearing (handled by page). No Sidebar badge increment.

## Technical Notes
-   **Socket Connections**: The implementation maintains a separate socket connection in the globally available context to ensure notifications work everywhere. `TeamsPage` maintains its own connection for full application logic. This is safe but implies two socket connections when on the Teams page (optimization potential for future, but adheres to strict "no refactor" rules).
-   **Sound**: Uses a base64 encoded audio string to avoid asset path issues.
