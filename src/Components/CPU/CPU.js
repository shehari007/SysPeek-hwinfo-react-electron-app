import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';
const si = window.require('systeminformation');

const SystemInfo = () => {

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
        si.cpu().then(data =>
            setcpuinfo(
                Object.keys(data).filter(key => key !== 'cache').map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : JSON.stringify(key).includes('speed') ? data[key] + 'GHz' : data[key],
                    key: index + 1,
                }))
            )
        );
        si.cpuCache().then(data =>
            setcpucache(
                Object.keys(data).filter(key => key !== 'cache').map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : JSON.stringify(key).includes('speed') ? data[key] + 'GHz' : formatBytes(data[key]),
                    key: index + 1,
                }))
            )
        );


    }, []);

    useEffect(() => {

    }, [])

    useEffect(() => {
        console.log(cpuinfo);

    }, [cpuinfo]); // Add systeminfo as a dependency


    return (
        <><Descriptions className='custom-descriptions' column={2} title="CPU Info" bordered items={cpuinfo} />
            <Descriptions className='custom-descriptions' column={2} title="Cache lvls Info" bordered items={cpucache} />

        </>
    )
}

export default SystemInfo
