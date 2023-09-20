import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';

const StorageDevices = ({ siData }) => {

    const [drivesinfo, setdrivesinfo] = useState(null);

    function formatBytes(bytes) {
        if (bytes < 1024) {
            return `${bytes} bytes`;
        } else if (bytes < 1024 * 1024) {
            const kb = (bytes / 1024).toFixed(2);
            return `${kb} KB`;
        } else if (bytes < 1024 * 1024 * 1024) {
            const mb = (bytes / (1024 * 1024)).toFixed(2);
            return `${mb} MB`;
        } else {
            const gb = (bytes / (1024 * 1024 * 1024)).toFixed(2);
            return `${gb} GB`;
        }
    }
    useEffect(() => {

        const data2 = siData.diskLayout;
        const mappedData = data2.map((drive, index) => {
            const keys = Object.keys(drive);
            const renderedKeyValues = keys.map((key) => (
                <p key={key}>
                    <strong>{key.toUpperCase()}:</strong> {drive[key] === true ? 'TRUE' : drive[key] === false ? 'FALSE' : JSON.stringify(key).includes('bytes') ? formatBytes(drive[key]) : JSON.stringify(key).includes('size') ? formatBytes(drive[key]) : drive[key]}
                </p>
            ));

            return {
                label: <b>{drive.vendor.toUpperCase()}</b>,
                children: (
                    <div>
                        {renderedKeyValues}
                    </div>
                ),
                key: index + 1,
            };
        });

        setdrivesinfo(mappedData);
    }, []);

    return (
        <>
            <Descriptions className='custom-descriptions' column={2} title="Drives Info" bordered items={drivesinfo} />
        </>
    )
}

export default StorageDevices
