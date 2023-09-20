import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';

const SystemInfo = ({siData}) => {

    const [battinfo, setbattinfo] = useState(null);

    useEffect(() => {
   
            setbattinfo(
                Object.keys(siData.battery).filter(key => key !== 'cache').map((key, index) => ({
                    label: <b>{key.toUpperCase()}</b>,
                    children: siData.battery[key] === false ? 'No' : siData.battery[key] === true ? 'Yes' : siData.battery[key],
                    key: index + 1,
                }))
            )    
    }, []);


    return (
        <><Descriptions className='custom-descriptions' column={2} title="Battery Info" bordered items={battinfo} />
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/><br/>
        </>
    )
}

export default SystemInfo
