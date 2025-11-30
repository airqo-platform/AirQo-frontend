import React from 'react';
import { ShippingLabel } from '@/app/types/devices';
import ReusableButton from '@/components/shared/button/ReusableButton';
import Image from 'next/image';

interface ShippingLabelPrintProps {
    labels: ShippingLabel[];
}

const ShippingLabelPrint: React.FC<ShippingLabelPrintProps> = ({ labels }) => {
    const printLabels = () => {
        window.print();
    };

    return (
        <div className="print-label">
            <div className="no-print">
                <ReusableButton onClick={printLabels} variant="filled">
                    Print Labels
                </ReusableButton>
            </div>

            {labels.map((label, index) => (
                <div key={index} className="shipping-label">
                    <div className="label-header">
                        <h2>AirQo Air Quality Monitor</h2>
                    </div>

                    <div className="device-info">
                        <p><strong>Device ID:</strong> {label.device_id}</p>
                        <p><strong>Claim Token:</strong> {label.claim_token}</p>
                    </div>

                    <div className="qr-code-section">
                        <Image
                            src={label.qr_code_image}
                            alt="QR Code for device claiming"
                            width={120}
                            height={120}
                            className="qr-code"
                            unoptimized
                        />
                    </div>

                    <div className="instructions">
                        <h3>Setup Instructions:</h3>
                        <ol>
                            {label.instructions.map((instruction, i) => (
                                <li key={i}>{i + 1}. {instruction}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShippingLabelPrint;
