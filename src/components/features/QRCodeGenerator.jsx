import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = ({ value, size = 128 }) => {
    if (!value) return null;

    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <QRCodeCanvas
                value={value}
                size={size}
                level={"H"}
                includeMargin={true}
            />
            <span className="mt-2 text-xs font-mono text-gray-400 break-all max-w-[200px] text-center">
                {value}
            </span>
        </div>
    );
};

export default QRCodeGenerator;
