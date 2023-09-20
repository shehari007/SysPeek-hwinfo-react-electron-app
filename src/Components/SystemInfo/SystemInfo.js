import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';

const SystemInfo = ({ siData }) => {

    const [systeminfo, setsysteminfo] = useState(null);
    const [systembios, setsystembios] = useState(null);
    const [systembaseb, setsystembaseb] = useState(null);
    const [systemchassis, setsystemchassis] = useState(null);

    useEffect(() => {

        setsysteminfo(
            Object.keys(siData.system).map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.system[key] === false ? 'No' : siData.system[key],
                key: index + 1,
            }))
        )

        setsystembios(
            Object.keys(siData.bios).map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.bios[key] === false ? 'No' : siData.bios[key],
                key: index + 1,
            }))
        )

        setsystembaseb(
            Object.keys(siData.baseboard).map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.baseboard[key] === false ? 'No' : siData.baseboard[key],
                key: index + 1,
            }))
        )

        setsystemchassis(
            Object.keys(siData.chassis).map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.chassis[key] === false ? 'No' : siData.chassis[key],
                key: index + 1,
            }))
        )


    }, []);

    return (
        <>
            <Descriptions className='custom-descriptions' column={1} title="System Info" bordered items={systeminfo} />
            <Descriptions className='custom-descriptions' column={1} title="Bios Info" bordered items={systembios} />
            <Descriptions className='custom-descriptions' column={1} title="BaseBoard Info" bordered items={systembaseb} />
            <Descriptions className='custom-descriptions' column={1} title="Chassis Info" bordered items={systemchassis} />
        </>
    )
}

export default SystemInfo
