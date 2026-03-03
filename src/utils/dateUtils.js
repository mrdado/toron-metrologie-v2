export const toDisplayDate = (isoDate) => {
    if (!isoDate || typeof isoDate !== 'string') return isoDate || '';
    // Expected ISO format: YYYY-MM-DD
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const fromDisplayDate = (displayDate) => {
    if (!displayDate || typeof displayDate !== 'string') return displayDate || '';
    // Expected Display format: DD/MM/AAAA
    const parts = displayDate.split('/');
    if (parts.length !== 3) return displayDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

/**
 * Parses various date formats into ISO (YYYY-MM-DD)
 * Handles: DD/MM/AAAA, AAAA-MM-DD, and native Date objects
 */
export const parseAnyDate = (date) => {
    if (!date) return '';

    // Handle native Date object (often from XLSX)
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }

    if (typeof date !== 'string') return String(date);

    // If already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
    }

    // If in DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        const parts = date.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return date;
};
