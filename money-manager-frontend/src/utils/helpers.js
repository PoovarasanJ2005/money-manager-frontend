import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (date) => {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'MMM dd, yyyy hh:mm a');
};

export const formatRelativeDate = (date) => {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(parsedDate)) {
        return `Today, ${format(parsedDate, 'hh:mm a')}`;
    } else if (isYesterday(parsedDate)) {
        return `Yesterday, ${format(parsedDate, 'hh:mm a')}`;
    } else if (isThisWeek(parsedDate)) {
        return format(parsedDate, 'EEEE, hh:mm a');
    } else if (isThisMonth(parsedDate)) {
        return format(parsedDate, 'MMM dd, hh:mm a');
    } else if (isThisYear(parsedDate)) {
        return format(parsedDate, 'MMM dd');
    } else {
        return format(parsedDate, 'MMM dd, yyyy');
    }
};

export const canEditTransaction = (createdAt) => {
    if (!createdAt) return false;
    const created = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    const timeDiff = Date.now() - created.getTime();
    return timeDiff < twelveHoursInMs;
};

export const getTimeRemaining = (createdAt) => {
    if (!createdAt) return '';
    const created = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    const timeDiff = Date.now() - created.getTime();
    const remaining = twelveHoursInMs - timeDiff;

    if (remaining <= 0) return 'Edit time expired';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
        return `${hours}h ${minutes}m remaining to edit`;
    } else {
        return `${minutes}m remaining to edit`;
    }
};

export const getDateRangeForPeriod = (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
        case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            break;
        case 'weekly':
            const dayOfWeek = now.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(now);
            startDate.setDate(now.getDate() - diff);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { startDate, endDate };
};

export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
};
