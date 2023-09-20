import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';

const SystemInfo = ({ siData }) => {

    const [cpuinfo, setcpuinfo] = useState(null);
    const [cpucache, setcpucache] = useState(null);

    function formatBytes(bytes) {
        if (bytes < 1024) {
            return `${bytes} bytes`;
        } else if (bytes < 1024 * 1024) {
            const kb = (bytes / 1024).toFixed(2);
            return `${kb} KB`;
        } else {
            const mb = (bytes / (1024 * 1024)).toFixed(2);
            return `${mb} MB`;
        }
    }

    useEffect(() => {

        setcpuinfo(
            Object.keys(siData.cpu).filter(key => key !== 'cache').map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.cpu[key] === false ? 'No' : JSON.stringify(key).includes('speed') ? siData.cpu[key] + 'GHz' : siData.cpu[key],
                key: index + 1,
            }))
        )


        setcpucache(
            Object.keys(siData.cpuCache).filter(key => key !== 'cache').map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: siData.cpuCache[key] === false ? 'No' : JSON.stringify(key).includes('speed') ? siData.cpuCache[key] + 'GHz' : formatBytes(siData.cpuCache[key]),
                key: index + 1,
            }))
        )

    }, []);
    useEffect(() => { console.log(siData) }, [cpuinfo])

    return (
        <><Descriptions className='custom-descriptions' column={2} title="CPU Info" bordered items={cpuinfo} />
            <Descriptions className='custom-descriptions' column={2} title="Cache lvls Info" bordered items={cpucache} />
        </>
    )
}

export default SystemInfo
