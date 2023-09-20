import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';

const WifiNetworks = ({ siData }) => {

    const [drivesinfo, setdrivesinfo] = useState(null);

    useEffect(() => {

        const ssids = siData.wifiNetworks.map(network => network);
        const ssidElements = ssids.map((ssid, index) => (
            <>
                <>
                    <p key={index}>{ssid.ssid === '' ? 'Hidden SSID' : ssid.ssid} <span><b>Quality: </b>{ssid.quality}%  <b>Channel: </b>{ssid.channel}</span></p></>
            </>
        ));

        const mappedData = [
            {
                label: <b>Available Wifi Networks</b>,
                children: (
                    <div>
                        {ssidElements}
                    </div>
                ),
                key: 1,
            },
        ];
        setdrivesinfo(mappedData);
    }, []);

    return (
        <>
            <Descriptions className='custom-descriptions' column={2} title="Wifi Networks in Range" bordered items={drivesinfo} />
        </>
    )
}

export default WifiNetworks
