import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a professional PDF invoice for a KIXX order.
 * 
 * Called ONLY after POST /api/orders/save returns 200.
 * 
 * @param {Object} orderData - { id, email, shippingAddress, items[], totalAmount, discount?, createdAt }
 */
export function generateInvoice(orderData) {
    if (!orderData) return;

    const doc = new jsPDF();
    
    // ── KIXX Brand Configuration ──
    const primaryColor = '#111111';
    const lightGray = '#F3F4F6';
    const darkGray = '#4B5563';
    const accentColor = '#31332c';

    // ── HEADER ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(primaryColor);
    doc.text('KIXX', 14, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(darkGray);
    doc.text('PREMIUM SNEAKER CURATION', 14, 32);

    // Invoice Meta (Top Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(accentColor);
    doc.text('INVOICE', 196, 25, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    
    const orderId = orderData.id || orderData.orderId || 'N/A';
    const shortId = String(orderId).length > 12 ? orderId.substring(0, 12) + '...' : orderId;
    doc.text(`Order: ${shortId}`, 196, 32, { align: 'right' });
    
    const orderDate = orderData.createdAt 
        ? new Date(orderData.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    doc.text(`Date: ${orderDate}`, 196, 38, { align: 'right' });
    doc.text('Payment: SUCCESS', 196, 44, { align: 'right' });

    // ── CUSTOMER INFO ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor);
    doc.text('Billed To:', 14, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.text(orderData.email || 'Customer', 14, 58);
    
    if (orderData.shippingAddress) {
        const address = orderData.shippingAddress;
        let yOffset = 64;
        if (address.firstName) {
            doc.text(`${address.firstName} ${address.lastName || ''}`, 14, yOffset);
            yOffset += 5;
        }
        if (address.address) {
            doc.text(address.address, 14, yOffset);
            yOffset += 5;
        }
        if (address.city) {
            doc.text(`${address.city} ${address.pinCode || address.pincode || ''}`, 14, yOffset);
        }
    }

    // ── TABLE DRAWING ──
    const items = orderData.items || [];
    const fmtPrice = (val) => {
        const num = Number(val || 0);
        return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const tableBody = items.map(item => [
        item.name || 'Curated Item',
        item.quantity || 1,
        fmtPrice(item.price),
        fmtPrice((Number(item.price || 0)) * Number(item.quantity || 1))
    ]);

    autoTable(doc, {
        startY: 88,
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
            fillColor: '#FAFAFA'
        },
        margin: { left: 14, right: 14 }
    });

    // ── FINANCIAL SUMMARY ──
    let currentY = doc.lastAutoTable.finalY + 15;
    
    const rawTotal = Number(orderData.totalAmount || 0);
    const discount = Number(orderData.discount || 0);
    const taxRate = 0.18; // 18% GST
    
    // Back-calculate: subtotal = (rawTotal / 1.18) + discount
    const subtotal = (rawTotal / (1 + taxRate)) + discount;
    const taxAmount = rawTotal - (rawTotal / (1 + taxRate));

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.text('Subtotal:', 140, currentY);
    doc.setTextColor(primaryColor);
    doc.text(fmtPrice(subtotal), 196, currentY, { align: 'right' });

    if (discount > 0) {
        currentY += 8;
        doc.setTextColor('#3856c4');
        doc.text('FIRSTDROP Discount:', 140, currentY);
        doc.text(`-${fmtPrice(discount)}`, 196, currentY, { align: 'right' });
    }

    currentY += 8;
    doc.setTextColor(darkGray);
    doc.text('Tax (18% GST):', 140, currentY);
    doc.setTextColor(primaryColor);
    doc.text(fmtPrice(taxAmount), 196, currentY, { align: 'right' });

    currentY += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total:', 140, currentY);
    doc.text(fmtPrice(rawTotal), 196, currentY, { align: 'right' });

    // ── FOOTER ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing KIXX. This is a computer-generated invoice.', 14, 275);
    doc.text('kixx.digital | support@kixx.digital', 196, 275, { align: 'right' });
    doc.text(`Invoice generated: ${new Date().toLocaleString('en-IN')}`, 14, 280);

    // Automatically trigger download
    doc.save(`KIXX_Invoice_${shortId}.pdf`);
}
