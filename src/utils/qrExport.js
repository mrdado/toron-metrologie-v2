import jsPDF from 'jspdf';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { toDisplayDate } from './dateUtils';

// Sanitize string for filenames
const sanitizeFileName = (name) => {
    return String(name || '')
        .replace(/[^a-zA-Z0-9_\-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'item';
};

/**
 * Exports items as an organized printable PDF sheet (3 columns x 3 rows grid per A4 page)
 */
export const exportQRCodesPDF = async (items, type = 'equipment') => {
    if (!items || items.length === 0) {
        alert("Aucun élément à exporter.");
        return;
    }

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const isEquipment = (type === 'equipment' || type === 'equipments');
    const titleText = isEquipment ? 'IPS TestLAB - Équipements QR Codes' : 'IPS TestLAB - Torons QR Codes';
    const dateStr = new Date().toLocaleDateString('fr-FR');

    // Page Grid setup (3 columns x 3 rows = 9 cards per page)
    const cardsPerRow = 3;
    const cardsPerPage = 9;
    const cardWidth = 56;  // mm
    const cardHeight = 72; // mm
    const startX = 14;     // mm margin left
    const startY = 32;     // mm margin top
    const gapX = 7;        // mm gap between columns
    const gapY = 8;        // mm gap between rows

    for (let i = 0; i < items.length; i++) {
        const pageItemIndex = i % cardsPerPage;

        if (i > 0 && pageItemIndex === 0) {
            doc.addPage();
        }

        // Draw Header on new page
        if (pageItemIndex === 0) {
            // Header Bar
            doc.setFillColor(75, 107, 166); // #4B6BA6 (Brand Blue)
            doc.rect(0, 0, 210, 18, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(titleText, 14, 12);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Exporté le: ${dateStr}  |  Total: ${items.length} éléments`, 130, 12);

            // Subtitle banner
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.text('Scannez les QR Codes pour accéder directement aux fiches métrologiques', 14, 25);
            doc.setDrawColor(226, 232, 240);
            doc.line(14, 27, 196, 27);
        }

        const col = pageItemIndex % cardsPerRow;
        const row = Math.floor(pageItemIndex / cardsPerRow);

        const x = startX + col * (cardWidth + gapX);
        const y = startY + row * (cardHeight + gapY);

        const item = items[i];
        const itemId = String(item.id || '');
        const itemName = isEquipment
            ? String(item.nom || 'Équipement')
            : String(item.fournisseur || 'Toron');
        const itemSubInfo = isEquipment
            ? `Type: ${item.type || 'Divers'}`
            : `Grade: ${item.grade || 'N/A'}`;
        const itemExtraInfo = isEquipment
            ? (item.dateExpiration ? `Exp: ${toDisplayDate(item.dateExpiration)}` : '')
            : (item.identification ? `ID: ${item.identification}` : '');

        // Draw Card Container Box
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

        // Top Accent Color Line
        doc.setFillColor(isEquipment ? 20 : 79, isEquipment ? 184 : 70, isEquipment ? 166 : 229);
        doc.rect(x, y, cardWidth, 2.5, 'F');

        // Generate QR Code Data URL
        try {
            const qrDataUrl = await QRCode.toDataURL(itemId, {
                width: 300,
                margin: 1,
                color: { dark: '#000000', light: '#FFFFFF' }
            });

            // Draw QR Code Image inside Card
            const qrSize = 34; // mm
            const qrX = x + (cardWidth - qrSize) / 2;
            const qrY = y + 5;
            doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
        } catch (qrErr) {
            console.error("Error generating QR for PDF:", qrErr);
        }

        // Draw Text inside Card
        doc.setTextColor(30, 41, 59); // slate-800
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const truncatedName = itemName.length > 22 ? itemName.substring(0, 20) + '...' : itemName;
        doc.text(truncatedName, x + cardWidth / 2, y + 43, { align: 'center' });

        doc.setTextColor(71, 85, 105); // slate-600
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(itemSubInfo, x + cardWidth / 2, y + 48, { align: 'center' });

        if (itemExtraInfo) {
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(7);
            doc.text(itemExtraInfo, x + cardWidth / 2, y + 53, { align: 'center' });
        }

        // Draw Mono ID at bottom
        doc.setFillColor(241, 245, 249);
        doc.rect(x + 2, y + 58, cardWidth - 4, 10, 'F');
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(6);
        doc.setFont('courier', 'normal');
        const truncatedId = itemId.length > 24 ? itemId.substring(0, 22) + '...' : itemId;
        doc.text(truncatedId, x + cardWidth / 2, y + 64, { align: 'center' });

        // Page Number Footer
        const totalPages = Math.ceil(items.length / cardsPerPage);
        const currentPage = Math.floor(i / cardsPerPage) + 1;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${currentPage} / ${totalPages}`, 196, 290, { align: 'right' });
    }

    const fileName = `QRCodes_${isEquipment ? 'Equipements' : 'Torons'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

/**
 * Exports items as a ZIP archive containing individual high-resolution PNG image files
 */
export const exportQRCodesZIP = async (items, type = 'equipment') => {
    if (!items || items.length === 0) {
        alert("Aucun élément à exporter.");
        return;
    }

    const zip = new JSZip();
    const isEquipment = (type === 'equipment' || type === 'equipments');
    const folderName = isEquipment ? 'QRCodes_Equipements' : 'QRCodes_Torons';
    const folder = zip.folder(folderName);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = String(item.id || '');
        const itemName = isEquipment
            ? String(item.nom || 'Equipement')
            : String(item.fournisseur || 'Toron');
        const itemExtra = isEquipment
            ? (item.type || 'Divers')
            : (item.identification || item.grade || '');

        const safeName = sanitizeFileName(itemName);
        const safeExtra = sanitizeFileName(itemExtra);
        const fileName = `QRCode_${safeName}_${safeExtra}_${itemId.substring(0, 8)}.png`;

        try {
            // Generate high-resolution PNG (600x600 px)
            const qrDataUrl = await QRCode.toDataURL(itemId, {
                width: 600,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' }
            });

            // Convert Base64 data URL to binary blob
            const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
            folder.file(fileName, base64Data, { base64: true });
        } catch (err) {
            console.error(`Error generating PNG for ${itemId}:`, err);
        }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `QRCodes_${isEquipment ? 'Equipements' : 'Torons'}_${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
};
