import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';
const si = window.require('systeminformation');

const MemoryInfo = () => {

    const [meminfo, setmeminfo] = useState(null);
    const [memLayout, setmemLayout] = useState(null);

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
        si.memLayout().then(data => {
            console.log(data);
            const mappedData = data.map((memory, index) => ({
              label: <b>{memory.bank}</b>, // Use the bank name as the label
              children: <div>
              <p><strong>Type:</strong> {memory.type}</p>
              <p><strong>Clock Speed:</strong> {memory.clockSpeed} MHz</p>
              <p><strong>Form Factor:</strong> {memory.formFactor}</p>
              <p><strong>Manufacturer:</strong> {memory.manufacturer}</p>
              <p><strong>Part Number:</strong> {memory.partNum}</p>
              <p><strong>Serial Number:</strong> {memory.serialNum}</p>
              <p><strong>Voltage Configured:</strong> {memory.voltageConfigured} V</p>
              <p><strong>Voltage Min:</strong> {memory.voltageMin} V</p>
              <p><strong>Voltage Max:</strong> {memory.voltageMax} V</p>
              <p><strong>Size:</strong> {formatBytes(memory.size)} bytes</p>
            </div>,
              key: index + 1,
            }));
      
            setmemLayout(mappedData);
          });
        


    }, []);

    return (
        <><Descriptions className='custom-descriptions' column={2} title="Mem Info" bordered items={meminfo} />
        <Descriptions className='custom-descriptions' column={2} title="Bank Details" bordered items={memLayout} />
            

        </>
    )
}

export default MemoryInfo
