import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';
const si = window.require('systeminformation');

const MemoryInfo = () => {

    const [meminfo, setmeminfo] = useState(null);


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
        si.mem().then(data =>
            setmeminfo(
                Object.keys(data).map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: formatBytes(data[key]) ,
                    key: index + 1,
                }))
            )
        );
        


    }, []);

    return (
        <><Descriptions className='custom-descriptions' column={2} title="Mem Info" bordered items={meminfo} />
            

        </>
    )
}

export default MemoryInfo
