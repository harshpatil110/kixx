import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateInvoice(orderData) {
    if (!orderData) return;

    const doc = new jsPDF();
    
    // ── KIXX Brand Configuration ──
    const primaryColor = '#111111';
    const lightGray = '#F3F4F6';
    const darkGray = '#4B5563';
    const maroonColor = '#800000';

    // ── HEADER ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(primaryColor);
    doc.text('KIXX', 14, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.text('PREMIUM SNEAKER COMMERCE', 14, 32);

    // Invoice Meta (Top Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(maroonColor);
    doc.text('INVOICE', 196, 25, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.text(`Order ID: ${orderData.id || orderData.orderId || 'N/A'}`, 196, 32, { align: 'right' });
    
    const orderDate = orderData.createdAt 
        ? new Date(orderData.createdAt).toLocaleDateString() 
        : new Date().toLocaleDateString();
    
    doc.text(`Date: ${orderDate}`, 196, 38, { align: 'right' });

    // ── CUSTOMER INFO ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Billed To:', 14, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.text(orderData.email || 'Customer', 14, 56);
    
    if (orderData.shippingAddress) {
        const address = orderData.shippingAddress;
        let yOffset = 62;
        if (address.firstName) {
            doc.text(`${address.firstName} ${address.lastName || ''}`, 14, yOffset);
            yOffset += 6;
        }
        if (address.address) {
            doc.text(address.address, 14, yOffset);
            yOffset += 6;
        }
        if (address.city) {
            doc.text(`${address.city}, ${address.state || ''} ${address.pincode || ''}`, 14, yOffset);
        }
    }

    // ── TABLE DRAWING ──
    const items = orderData.items || [];
    const tableBody = items.map(item => [
        item.name || 'Unknown Item',
        item.quantity || 1,
        `$${Number(item.price || 0).toFixed(2)}`,
        `$${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 85,
        head: [['Item Description', 'Qty', 'Unit Price', 'Line Total']],
        body: tableBody,
        theme: 'plain',
        headStyles: {
            fillColor: lightGray,
            textColor: primaryColor,
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: {
            textColor: darkGray,
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' }
        },
        alternateRowStyles: {
            fillColor: '#FAFAFA' // very light grey for pure brutalist table clarity
        },
        margin: { left: 14, right: 14 }
    });

    // ── FINANCIAL SUMMARY ──
    let currentY = doc.lastAutoTable.finalY + 15;
    
    const rawTotal = Number(orderData.totalAmount || 0);
    const taxRate = 0.18; // 18% GST calculation
    const subtotal = rawTotal / (1 + taxRate);
    const taxAmount = rawTotal - subtotal;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.text('Subtotal:', 140, currentY);
    doc.setTextColor(primaryColor);
    doc.text(`$${subtotal.toFixed(2)}`, 196, currentY, { align: 'right' });

    currentY += 8;
    doc.setTextColor(darkGray);
    doc.text('Tax (18% GST):', 140, currentY);
    doc.setTextColor(primaryColor);
    doc.text(`$${taxAmount.toFixed(2)}`, 196, currentY, { align: 'right' });

    currentY += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total:', 140, currentY);
    doc.text(`$${rawTotal.toFixed(2)}`, 196, currentY, { align: 'right' });

    // ── FOOTER ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing KIXX.', 14, 280);
    doc.text('kixx.com | support@kixx.com', 196, 280, { align: 'right' });

    // Automatically trigger download
    doc.save(`KIXX_Invoice_${orderData.id || orderData.orderId || 'Download'}.pdf`);
}
