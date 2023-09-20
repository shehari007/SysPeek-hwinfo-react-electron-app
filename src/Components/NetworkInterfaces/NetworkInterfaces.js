import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';

const StorageDevices = ({ siData }) => {

    const [interfaceinfo, setinterfaceinfo] = useState(null);
    const [definterface, setdefinterface] = useState(null);

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


        const data2 = siData.networkInterfaces;
        const mappedData = data2.map((drive, index) => {
            const keys = Object.keys(drive);

            const renderedKeyValues = keys.map((key) => (
                <p key={key}>
                    <strong>{key.toUpperCase()}:</strong> {drive[key] === true ? 'TRUE' : drive[key] === false ? 'FALSE' : JSON.stringify(key).includes('bytes') ? formatBytes(drive[key]) : JSON.stringify(key).includes('speed') ? drive[key] + ' Mbps' : drive[key]}
                </p>
            ));

            return {
                label: <b>{drive.ifaceName.toUpperCase()}</b>,
                children: (
                    <div>
                        {renderedKeyValues}
                    </div>
                ),
                key: index + 1,
            };
        });
        setinterfaceinfo(mappedData);

        setdefinterface([
            {
                label: 'Default Interface',
                children: siData.networkInterfaceDefault,
                key: 1
            },
            {
                label: 'Gateway',
                children: siData.networkGatewayDefault,
                key: 2
            }
        ]);
    }, []);

    useEffect(() => {
        console.log(interfaceinfo);
    }, [interfaceinfo])

    return (
        <>
            <Descriptions className='custom-descriptions' column={2} title="Interfaces Info" bordered items={interfaceinfo} />
            <Descriptions className='custom-descriptions' column={2} title="Default Interface" bordered items={definterface} />
        </>
    )
}

export default StorageDevices
