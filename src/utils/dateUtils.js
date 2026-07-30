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
 * Handles: DD/MM/AAAA, M/D/YY, AAAA-MM-DD, Excel numbers, and native Date objects (timezone-safe)
 */
export const parseAnyDate = (date) => {
    if (!date) return '';

    // Handle native Date object (often from XLSX)
    if (date instanceof Date) {
        if (isNaN(date.getTime())) return '';
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

    // If in M/D/YY, M/D/YYYY, DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str)) {
        const parts = str.split('/');
        let year = parts[2];
        if (year.length === 2) {
            year = '20' + year;
        }
        const p1 = parseInt(parts[0], 10);
        const p2 = parseInt(parts[1], 10);
        if (p1 > 12) {
            // DD/MM/YYYY
            return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
        } else if (p2 > 12) {
            // MM/DD/YYYY
            return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
        } else {
            // Default to MM/DD/YYYY if US locale string or DD/MM/YYYY
            return `${year}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
        }
    }

    return str;
};
