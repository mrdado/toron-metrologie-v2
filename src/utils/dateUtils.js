export const toDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    const str = String(isoDate).trim();
    if (!str) return '';
    
    // Handle YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
    }
    
    // Handle ISO timestamps like YYYY-MM-DDTHH:mm...
    if (str.includes('T')) {
        const dateOnly = str.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
            const [y, m, d] = dateOnly.split('-');
            return `${d}/${m}/${y}`;
        }
    }
    
    return str;
};

export const fromDisplayDate = (displayDate) => {
    if (!displayDate) return '';
    const str = String(displayDate).trim();
    if (!str) return '';
    const parts = str.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return str;
};

/**
 * Parses various date formats into ISO (YYYY-MM-DD)
 * Handles: DD/MM/AAAA, AAAA-MM-DD, Excel numbers, and native Date objects (timezone-safe)
 */
export const parseAnyDate = (date) => {
    if (!date) return '';

    // Handle native Date object (often from XLSX)
    if (date instanceof Date) {
        if (isNaN(date.getTime())) return '';
        // Use local timezone components to avoid GMT offset day-shifts
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // Handle Excel Serial Number (numeric)
    if (typeof date === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const jsDate = new Date(excelEpoch.getTime() + date * 86400000);
        const yyyy = jsDate.getUTCFullYear();
        const mm = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(jsDate.getUTCDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    const str = String(date).trim();
    if (!str) return '';

    // If already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
    }

    // If ISO string with T
    if (str.includes('T')) {
        const datePart = str.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
    }

    // If in DD/MM/AAAA or D/M/AAAA
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
        const parts = str.split('/');
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    return str;
};
