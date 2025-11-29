"use client";

import React from 'react';
import { ShippingLabel } from '@/app/types/devices';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import { Printer } from 'lucide-react';
import Image from 'next/image';

interface ShippingLabelPrintModalProps {
    labels: ShippingLabel[];
    isOpen: boolean;
    onClose: () => void;
}

const ShippingLabelPrintModal: React.FC<ShippingLabelPrintModalProps> = ({ labels, isOpen, onClose }) => {
    const handlePrint = () => {
        // Generate HTML for the new window
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            alert('Please allow pop-ups for this site to print labels');
            return;
        }

        // Build the complete HTML document for the print window
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Shipping Labels - AirQo</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f5f5;
                        padding: 20px;
                    }
                    
                    .print-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(4in, 1fr));
                        gap: 1rem;
                        justify-items: center;
                        max-width: 1400px;
                        margin: 0 auto;
                    }
                    
                    .shipping-label {
                        width: 4in;
                        height: 6in;
                        border: 2px solid #000;
                        padding: 0.5in;
                        background: white;
                        color: black;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    .label-header h2 {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 0.5in;
                    }
                    
                    .device-info {
                        margin: 0.4in 0;
                    }
                    
                    .device-info p {
                        margin-bottom: 0.2in;
                    }
                    
                    .device-info strong {
                        font-weight: bold;
                    }
                    
                    .qr-code-section {
                        display: flex;
                        justify-content: center;
                        margin: 0.4in 0;
                    }
                    
                    .qr-code {
                        width: 2in;
                        height: 2in;
                    }
                    
                    .instructions h3 {
                        font-weight: bold;
                        margin-bottom: 0.2in;
                    }
                    
                    .instructions ol {
                        list-style: decimal;
                        padding-left: 0.5in;
                    }
                    
                    .instructions li {
                        margin-bottom: 0.1in;
                    }
                    
                    @media screen and (max-width: 1200px) {
                        .print-container {
                            grid-template-columns: 1fr;
                        }
                    }
                    
                    @media print {
                        body {
                            background: white;
                            padding: 0;
                        }
                        
                        .print-container {
                            display: block;
                            max-width: none;
                        }
                        
                        .shipping-label {
                            margin: 0;
                            box-shadow: none;
                            page-break-after: always;
                        }
                        
                        .shipping-label:last-child {
                            page-break-after: auto;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    ${labels.map(label => `
                        <div class="shipping-label">
                            <div class="label-header">
                                <h2>AirQo Air Quality Monitor</h2>
                            </div>
                            <div class="device-info">
                                <p><strong>Device ID:</strong> ${label.device_id}</p>
                                <p><strong>Claim Token:</strong> ${label.claim_token}</p>
                            </div>
                            <div class="qr-code-section">
                                <img src="${label.qr_code_image}" alt="QR Code for device claiming" class="qr-code" />
                            </div>
                            <div class="instructions">
                                <h3>Setup Instructions:</h3>
                                <ol>
                                    ${label.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                                </ol>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;

        // Write content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for images to load, then trigger print dialog
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    };

    return (
        <ReusableDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Shipping Labels"
            subtitle={`${labels.length} ${labels.length === 1 ? 'label' : 'labels'} ready to print`}
            icon={Printer}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-100 dark:bg-blue-900/20"
            size="6xl"
            contentClassName="bg-gray-50 dark:bg-gray-950"
            contentAreaClassName="p-6"
            showFooter={true}
            primaryAction={{
                label: 'Print Labels',
                onClick: handlePrint,
            }}
            secondaryAction={{
                label: 'Close',
                onClick: onClose,
                variant: 'outline',
            }}
            ariaLabel="Shipping labels print dialog"
        >
            <div className="print-container">
                {labels.map((label, index) => (
                    <div key={index} className="shipping-label">
                        <div className="label-header">
                            <h2 className="text-xl font-bold">AirQo Air Quality Monitor</h2>
                        </div>

                        <div className="device-info my-4">
                            <p><strong>Device ID:</strong> {label.device_id}</p>
                            <p><strong>Claim Token:</strong> {label.claim_token}</p>
                        </div>

                        <div className="qr-code-section flex justify-center my-4">
                            <Image
                                src={label.qr_code_image}
                                alt="QR Code for device claiming"
                                width={192}
                                height={192}
                                className="qr-code"
                                unoptimized
                            />
                        </div>

                        <div className="instructions">
                            <h3 className="font-bold mb-2">Setup Instructions:</h3>
                            <ol className="list-decimal pl-5">
                                {label.instructions.map((instruction, i) => (
                                    <li key={i}>{instruction}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                /* Container for labels - Grid layout */
                .print-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(4in, 1fr));
                    gap: 1rem;
                    justify-items: center;
                }
                
                .shipping-label {
                    width: 4in;
                    height: 6in;
                    border: 2px solid #000;
                    padding: 0.5in;
                    font-family: Arial, sans-serif;
                    background: white;
                    color: black;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .qr-code {
                    width: 2in;
                    height: 2in;
                }
                
                @media screen and (max-width: 1200px) {
                    .print-container {
                        grid-template-columns: 1fr;
                    }
                }
                
                @media print {
                    /* Hide everything except labels */
                    body * {
                        visibility: hidden;
                    }
                    
                    .print-container,
                    .print-container * {
                        visibility: visible;
                    }
                    
                    .print-container {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        background: white;
                        display: block;
                    }
                    
                    .shipping-label {
                        margin: 0;
                        border: 2px solid #000;
                        page-break-after: always;
                        box-shadow: none;
                    }
                    
                    .shipping-label:last-child {
                        page-break-after: auto;
                    }
                }
            `}</style>
        </ReusableDialog>
    );
};

export default ShippingLabelPrintModal;
