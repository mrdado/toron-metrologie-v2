import jsPDF from 'jspdf';
import JSZip from 'jszip';
import QRCode from 'qrcode';

/**
 * Normalizes string by stripping French accents/diacritics and converting spaces to underscores.
 * e.g., "Déplacement" -> "Deplacement", "Règle" -> "Regle", "Équipement 01" -> "Equipement_01"
 */
const sanitizeFileName = (name) => {
    if (!name) return '';
    return String(name)
        .normalize('NFD')                    // Decompose accented chars (e.g. 'é' -> 'e' + accent mark)
        .replace(/[\u0300-\u036f]/g, '')    // Remove accent marks
        .replace(/[^a-zA-Z0-9_\-\s]/g, '')  // Remove special symbols
        .trim()
        .replace(/\s+/g, '_');               // Replace spaces with underscores
};

/**
 * Exports items as a clean printable PDF sheet (3 columns x 3 rows grid per A4 page)
 * Each card contains ONLY the QR Code and the "nom".
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

    // Grid layout (3 columns x 3 rows = 9 cards per page)
    const cardsPerRow = 3;
    const cardsPerPage = 9;
    const cardWidth = 56;  // mm
    const cardHeight = 65; // mm (compact height for QR code + nom)
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
            : String(item.fournisseur || item.identification || 'Toron');

        // Draw Card Box
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

        // Top Accent Color Line
        doc.setFillColor(isEquipment ? 20 : 79, isEquipment ? 184 : 70, isEquipment ? 166 : 229);
        doc.rect(x, y, cardWidth, 2.5, 'F');

        // Generate and draw QR Code (Size: 38mm x 38mm)
        try {
            const qrDataUrl = await QRCode.toDataURL(itemId, {
                width: 400,
                margin: 1,
                color: { dark: '#000000', light: '#FFFFFF' }
            });

            const qrSize = 38; // mm
            const qrX = x + (cardWidth - qrSize) / 2;
            const qrY = y + 5;
            doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
        } catch (qrErr) {
            console.error("Error generating QR for PDF:", qrErr);
        }

        // Draw ONLY the "Nom" below the QR Code
        doc.setTextColor(30, 41, 59); // slate-800
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const truncatedName = itemName.length > 22 ? itemName.substring(0, 20) + '...' : itemName;
        doc.text(truncatedName, x + cardWidth / 2, y + 52, { align: 'center' });

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
 * Exports items as a ZIP archive containing individual high-resolution PNG image files.
 * File names are strictly [Type]_[Nom].png (with French accents properly normalized).
 * Example: "Déplacement" + "Capteur 01" -> "Deplacement_Capteur_01.png"
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

    const usedFileNames = new Set();

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = String(item.id || '');

        const itemType = isEquipment
            ? String(item.type || 'Divers')
            : String(item.utilisation || item.grade || 'Toron');

        const itemName = isEquipment
            ? String(item.nom || 'Equipement')
            : String(item.fournisseur || item.identification || 'Toron');

        const cleanType = sanitizeFileName(itemType);
        const cleanNom = sanitizeFileName(itemName);

        // Strict format: [Type]_[Nom].png
        let baseFileName = `${cleanType}_${cleanNom}`;
        let fileName = `${baseFileName}.png`;

        // Handle duplicates safely if two items have identical Type and Nom
        let duplicateCounter = 1;
        while (usedFileNames.has(fileName.toLowerCase())) {
            duplicateCounter++;
            fileName = `${baseFileName}_${duplicateCounter}.png`;
        }
        usedFileNames.add(fileName.toLowerCase());

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
