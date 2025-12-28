// src/components/teams/TeamsNotificationWrapper.jsx
// Wrapper component that renders Teams notification components
import TeamsNotificationToast from "./TeamsNotificationToast";
import TeamsFloatingChat from "./TeamsFloatingChat";

export default function TeamsNotificationWrapper() {
    return (
        <>
            <TeamsNotificationToast />
            <TeamsFloatingChat />
        </>
    );
}
