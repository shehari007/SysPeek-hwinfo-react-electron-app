import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';

const SystemInfo = ({ siData }) => {

    const [osinfo, setosinfo] = useState(null);
    const [osuuid, setosuuid] = useState(null);
    const [osshell, setosshell] = useState(null);

    useEffect(() => {

        setosinfo(
            Object.keys(siData.osInfo).map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.osInfo[key] === false ? 'No' : siData.osInfo[key] === true ? 'Yes' : siData.osInfo[key],
                key: index + 1,
            }))
        )


        setosuuid(
            Object.keys(siData.uuid).map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.uuid[key] === false ? 'No' : siData.uuid[key] === true ? 'Yes' : siData.uuid[key],
                key: index + 1,
            }))
        )


        const filteredData = Object.keys(siData.versions)
            .filter(key => siData.versions[key] !== '')
            .map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.versions[key],
                key: index + 1,
            }));

        setosshell(filteredData);

    }, []);

    return (
        <>
            <Descriptions className='custom-descriptions' column={2} title="OS Info" bordered items={osinfo} />
            <Descriptions className='custom-descriptions' column={2} title="OS UUID" bordered items={osuuid} />
            <Descriptions className='custom-descriptions' column={2} title="OS INSTALLED SYSTEM APPS VERSIONS" bordered items={osshell} />
        </>
    )
}

export default SystemInfo
