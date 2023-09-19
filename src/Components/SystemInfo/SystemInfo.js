import React, { useState, useEffect } from 'react'
import { Descriptions  } from 'antd';
const si = window.require('systeminformation');

const SystemInfo = () => {

    const [systeminfo, setsysteminfo] = useState(null);
    const [systembios, setsystembios] = useState(null);
    const [systembaseb, setsystembaseb] = useState(null);
    const [systemchassis, setsystemchassis] = useState(null);

    useEffect(() => {
        si.system().then(data =>
            setsysteminfo(
                Object.keys(data).map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : data[key],
                    key: index + 1,
                }))
            )
        );
        si.bios().then(data =>
            setsystembios(
                Object.keys(data).map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : data[key],
                    key: index + 1,
                }))
            )
        );
        si.baseboard().then(data =>
            setsystembaseb(
                Object.keys(data).map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : data[key],
                    key: index + 1,
                }))
            )
        );
        si.chassis().then(data =>
            setsystemchassis(
                Object.keys(data).map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : data[key],
                    key: index + 1,
                }))
            )
        );

    }, []); // Empty dependency array to run this effect only once

    useEffect(() => {
        console.log(systeminfo);
        console.log(systembios);
    }, [systeminfo, systembios]); // Add systeminfo as a dependency


    return (
        <><Descriptions className='custom-descriptions' column={1} title="System Info" bordered items={systeminfo} />
            <Descriptions className='custom-descriptions' column={1} title="Bios Info" bordered items={systembios} />
            <Descriptions className='custom-descriptions' column={1} title="BaseBoard Info" bordered items={systembaseb} />
            <Descriptions className='custom-descriptions' column={1} title="Chassis Info" bordered items={systemchassis} />
          </>
    )
}

export default SystemInfo
