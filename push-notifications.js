// 推送通知功能模块

// 检查浏览器是否支持通知
function isNotificationSupported() {
    return 'Notification' in window;
}

// 请求通知权限
function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        console.log('浏览器不支持通知功能');
        return Promise.resolve(false);
    }

    return Notification.requestPermission().then(permission => {
        console.log('通知权限状态:', permission);
        return permission === 'granted';
    });
}

// 发送通知
function sendNotification(title, options = {}) {
    if (!isNotificationSupported()) {
        console.log('浏览器不支持通知功能');
        return false;
    }

    if (Notification.permission !== 'granted') {
        console.log('通知权限未授予');
        return false;
    }

    try {
        new Notification(title, options);
        return true;
    } catch (error) {
        console.error('发送通知时出错:', error);
        return false;
    }
}

// 发送异常推送通知
function sendAbnormalNotification(orderId, processName, inspectionType) {
    const title = '质检异常提醒';
    const options = {
        body: `工单 ${orderId} 的 ${processName} 工序 ${inspectionType} 出现不合格，需要及时处理！`,
        icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=warning%20icon%20red%20alert&image_size=square',
        tag: `abnormal_${orderId}_${Date.now()}`,
        requireInteraction: true
    };

    return sendNotification(title, options);
}

// 发送逾期提醒通知
function sendOverdueNotification(orderId, deliveryDate) {
    const title = '交期逾期提醒';
    const options = {
        body: `工单 ${orderId} 已逾期，交期为 ${deliveryDate}，请及时处理！`,
        icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clock%20icon%20warning&image_size=square',
        tag: `overdue_${orderId}_${Date.now()}`,
        requireInteraction: true
    };

    return sendNotification(title, options);
}

// 检查并发送逾期提醒
function checkAndSendOverdueNotifications() {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
        return;
    }

    const workOrders = loadWorkOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    workOrders.forEach(order => {
        const deliveryDate = new Date(order.deliveryDate);
        deliveryDate.setHours(0, 0, 0, 0);

        if (deliveryDate < today) {
            // 检查是否已经发送过提醒
            const lastReminder = localStorage.getItem(`lastOverdueReminder_${order.orderId}`);
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            // 如果没有发送过提醒，或者上次发送提醒已经超过一天，则发送新的提醒
            if (!lastReminder || (now - parseInt(lastReminder)) > oneDay) {
                sendOverdueNotification(order.orderId, order.deliveryDate);
                localStorage.setItem(`lastOverdueReminder_${order.orderId}`, now.toString());
            }
        }
    });
}

// 从localStorage加载工单数据
function loadWorkOrders() {
    const data = localStorage.getItem('workOrders');
    return data ? JSON.parse(data) : [];
}

// 初始化推送功能
function initPushNotifications() {
    // 请求通知权限
    requestNotificationPermission().then(granted => {
        if (granted) {
            console.log('通知权限已授予');
            // 检查逾期工单并发送提醒
            checkAndSendOverdueNotifications();
            // 设置定期检查逾期工单的定时器
            setInterval(checkAndSendOverdueNotifications, 60 * 60 * 1000); // 每小时检查一次
        } else {
            console.log('通知权限未授予');
        }
    });
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initPushNotifications,
        sendAbnormalNotification,
        sendOverdueNotification,
        checkAndSendOverdueNotifications,
        requestNotificationPermission
    };
}
