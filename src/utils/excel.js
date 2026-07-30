import * as XLSX from 'xlsx';
import { parseAnyDate } from './dateUtils';

export const exportToExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventaire");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Normalizes Equipment Type strings:
 * Converts GBE "Capteur de déplacement" -> "Déplacement", "Capteur de pression" -> "Pression", etc.
 */
const normalizeEquipmentType = (val) => {
    if (!val) return 'Divers';
    let str = String(val).trim();

    // Strip "Capteur de " or "Capteur d'" prefix from GBE exports
    str = str.replace(/^Capteur\s+de\s+/i, '');
    str = str.replace(/^Capteur\s+d'/i, '');

    if (!str) return 'Divers';
    str = str.charAt(0).toUpperCase() + str.slice(1);

    // Map to standard app categories
    const aliasMap = {
        'Deplacement': 'Déplacement',
        'Temperature': 'Température',
        'Pression': 'Pression',
        'Force': 'Force',
        'Machine': 'Machine',
        'Acquisition': 'Acquisition',
        'Déplacement': 'Déplacement',
        'Température': 'Température'
    };

    return aliasMap[str] || str;
};

/**
 * Smart Excel Importer:
 * Auto-detects header row (line 1 or line 6 from GBE), handles column mapping, and normalizes types/dates.
 */
export const importFromExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Read raw array of rows to handle multi-line headers (e.g. GBE files starting at row 6)
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
                if (!Array.isArray(rawRows) || rawRows.length === 0) {
                    resolve([]);
                    return;
                }

                // Locate header row dynamically within first 20 rows
                let headerIdx = -1;
                for (let i = 0; i < Math.min(20, rawRows.length); i++) {
                    const row = rawRows[i];
                    if (!Array.isArray(row)) continue;

                    // A true header row must have at least 3 non-empty column cells
                    const filledCells = row.filter(c => c !== undefined && c !== null && String(c).trim() !== '');
                    if (filledCells.length < 3) continue;

                    const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
                    if (
                        rowStr.includes('numéro') || rowStr.includes('numero') ||
                        rowStr.includes('type générique') || rowStr.includes('type generique') ||
                        rowStr.includes('nom') || rowStr.includes('uuid') || rowStr.includes('statut')
                    ) {
                        headerIdx = i;
                        break;
                    }
                }

                if (headerIdx === -1) headerIdx = 0;

                const headers = (rawRows[headerIdx] || []).map(h => String(h || '').trim());
                const dataRows = rawRows.slice(headerIdx + 1);

                // Helper to match column index by keywords
                const findColIdx = (possibleKeywords, exactMatch = false) => {
                    return headers.findIndex(h => {
                        const hLower = h.toLowerCase().trim();
                        if (exactMatch) {
                            return possibleKeywords.some(kw => hLower === kw.toLowerCase());
                        }
                        return possibleKeywords.some(kw => hLower.includes(kw.toLowerCase()));
                    });
                };

                const colUUID = findColIdx(['uuid', 'id', 'id equipement', 'id équipement'], true);
                const colNom = findColIdx(['numéro', 'numero', 'nom', 'name', 'équipement', 'equipement']);
                const colType = findColIdx(['type générique', 'type generique', 'type', 'catégorie', 'categorie']);
                const colCal = findColIdx(['date de création', 'date calibration', 'calibration', 'étalonnage', 'etalonnage']);
                const colExp = findColIdx(['fin de validité', 'validité', 'expiration']);
                const colFormula = findColIdx(['facteur de conversion', 'formule', 'etalonnage', 'étalonnage']);

                const parsedItems = [];

                dataRows.forEach(row => {
                    if (!Array.isArray(row) || row.length === 0) return;

                    // Column D or C or Nom fallback
                    const rawNom = colNom !== -1 ? row[colNom] : (colUUID !== -1 ? row[colUUID] : undefined);
                    if (rawNom === undefined || rawNom === null || String(rawNom).trim() === '' || String(rawNom).trim() === 'Numéro') return;

                    const uuid = colUUID !== -1 && row[colUUID] ? String(row[colUUID]).trim() : undefined;
                    const nom = String(rawNom).trim();
                    const type = colType !== -1 ? normalizeEquipmentType(row[colType]) : 'Divers';
                    const dateCalibration = colCal !== -1 ? parseAnyDate(row[colCal]) : '';
                    const dateExpiration = colExp !== -1 ? parseAnyDate(row[colExp]) : '';
                    const etalonnage = colFormula !== -1 && row[colFormula] !== undefined && row[colFormula] !== null ? String(row[colFormula]).trim() : '';

                    parsedItems.push({
                        uuid,
                        nom,
                        type,
                        dateCalibration,
                        dateExpiration,
                        etalonnage
                    });
                });

                resolve(parsedItems);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
