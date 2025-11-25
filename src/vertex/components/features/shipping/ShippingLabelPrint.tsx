import React from 'react';
import { ShippingLabel } from '@/app/types/devices';
import ReusableButton from '@/components/shared/button/ReusableButton';

interface ShippingLabelPrintProps {
    labels: ShippingLabel[];
}

const ShippingLabelPrint: React.FC<ShippingLabelPrintProps> = ({ labels }) => {
    const printLabels = () => {
        window.print();
    };

    return (
        <div className="print-container">
            <div className="no-print mb-4">
                <ReusableButton onClick={printLabels} variant="filled">
                    Print Labels
                </ReusableButton>
            </div>

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
                        <img
                            src={label.qr_code_image}
                            alt="QR Code for device claiming"
                            className="qr-code"
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

            <style jsx>{`
        .shipping-label {
          width: 4in;
          height: 6in;
          border: 2px solid #000;
          padding: 0.5in;
          margin: 0.25in;
          page-break-after: always;
          font-family: Arial, sans-serif;
          background: white;
          color: black;
        }
        
        .qr-code {
          width: 2in;
          height: 2in;
        }
        
        @media print {
          .no-print { display: none; }
          body { background: white; }
          .print-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: white;
            z-index: 9999;
          }
        }
      `}</style>
        </div>
    );
};

export default ShippingLabelPrint;
