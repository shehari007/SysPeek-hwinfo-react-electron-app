import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';
const si = window.require('systeminformation');

const Graphics = () => {

    const [graphicsinfo, setgraphicsinfo] = useState(null);
    const [memLayout, setmemLayout] = useState(null);
    var length;
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

        si.graphics().then(data => {
            console.log(data.controllers);
            const data2 = data.controllers;
            const mappedData = data2.map((graphic, index) => {
              const keys = Object.keys(graphic);
          
              const renderedKeyValues = keys.map((key) => (
                <p key={key}>
                  <strong>{key.toUpperCase()}:</strong> {graphic[key] === true ? 'True' : graphic[key] === false ? 'False' : graphic[key]}
                </p>
              ));
          
              return {
                label: <b>{graphic.vendor}</b>,
                children: (
                  <div>
                    {renderedKeyValues}
                  </div>
                ),
                key: index + 1,
              };
            });
          
            setgraphicsinfo(mappedData);
          });
          
        
        // si.memLayout().then(data => {
        //     console.log(data);
        //     const mappedData = data.map((graphic, index) => ({
        //       label: <b>{graphic.bank}</b>, // Use the bank name as the label
        //       children: <div>
        //       <p><strong>Type:</strong> {graphic.type}</p>
        //       <p><strong>Clock Speed:</strong> {graphic.clockSpeed} MHz</p>
        //       <p><strong>Form Factor:</strong> {graphic.formFactor}</p>
        //       <p><strong>Manufacturer:</strong> {graphic.manufacturer}</p>
        //       <p><strong>Part Number:</strong> {graphic.partNum}</p>
        //       <p><strong>Serial Number:</strong> {graphic.serialNum}</p>
        //       <p><strong>Voltage Configured:</strong> {graphic.voltageConfigured} V</p>
        //       <p><strong>Voltage Min:</strong> {graphic.voltageMin} V</p>
        //       <p><strong>Voltage Max:</strong> {graphic.voltageMax} V</p>
        //       <p><strong>Size:</strong> {formatBytes(graphic.size)} bytes</p>
        //     </div>,
        //       key: index + 1,
        //     }));
      
        //     setmemLayout(mappedData);
        //   });
        


    }, []);

    return (
        <><Descriptions className='custom-descriptions' column={2} title="Graphics Info" bordered items={graphicsinfo} />
        {/* <Descriptions className='custom-descriptions' column={2} title="Bank Details" bordered items={memLayout} /> */}
            

        </>
    )
}

export default Graphics
