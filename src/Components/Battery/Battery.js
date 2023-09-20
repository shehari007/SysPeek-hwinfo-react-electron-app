import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';
const si = window.require('systeminformation');

const SystemInfo = () => {

    const [battinfo, setbattinfo] = useState(null);

    useEffect(() => {
        si.battery().then(data =>
            setbattinfo(
                Object.keys(data).filter(key => key !== 'cache').map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: data[key] === false ? 'No' : data[key] === true ? 'Yes' : data[key],
                    key: index + 1,
                }))
            )
        );



    }, []);
    useEffect(() => {
        console.log(battinfo)
    }, [battinfo])

    return (
        <><Descriptions className='custom-descriptions' column={2} title="Battery Info" bordered items={battinfo} />


        </>
    )
}

export default SystemInfo
