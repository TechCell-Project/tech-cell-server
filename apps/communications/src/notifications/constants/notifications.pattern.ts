export const NotifyEventPattern = {
    newOrderCreated: { event: 'notifications.push.new_order_created' },
    orderStatusChanged: { event: 'notifications.push.order_status_changed' },
};

export const NotifyMessagePattern = {
    getUsersNotifications: { cmd: 'notifications_message_pattern.get_users_notifications' },
    markAsRead: { cmd: 'notifications_message_pattern.mark_as_read' },
};
