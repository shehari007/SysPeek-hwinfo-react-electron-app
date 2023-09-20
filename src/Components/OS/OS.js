import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';
const si = window.require('systeminformation');

const SystemInfo = () => {

    const [osinfo, setosinfo] = useState(null);
    const [osuuid, setosuuid] = useState(null);
    const [osshell, setosshell] = useState(null);

    useEffect(() => {
        si.osInfo().then(data =>
            setosinfo(
                Object.keys(data).map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : data[key] === true ? 'Yes' : data[key],
                    key: index + 1,
                }))
            )
        );
        si.uuid().then(data =>
            setosuuid(
                Object.keys(data).map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : data[key] === true ? 'Yes' : data[key],
                    key: index + 1,
                }))
            )
        );
        si.versions().then(data => {
            const filteredData = Object.keys(data)
              .filter(key => data[key] !== '') 
              .map((key, index) => ({
                label: <b>{key.toUpperCase()}</b>,
                children: data[key],
                key: index + 1,
              }));
          
            setosshell(filteredData);
          });


    }, []);
    useEffect(() => {
        console.log(osinfo)
        console.log(osshell)
    }, [osinfo, osshell])

    return (
        <><Descriptions className='custom-descriptions' column={2} title="OS Info" bordered items={osinfo} />
            <Descriptions className='custom-descriptions' column={2} title="OS UUID" bordered items={osuuid} />
            <Descriptions className='custom-descriptions' column={2} title="OS INSTALLED SYSTEM APPS VERSIONS" bordered items={osshell} />

        </>
    )
}

export default SystemInfo
