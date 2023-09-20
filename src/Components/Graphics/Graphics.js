import React, { useState, useEffect } from 'react'
import { Descriptions } from 'antd';

const Graphics = ({ siData }) => {

  const [graphicsinfo, setgraphicsinfo] = useState(null);

  useEffect(() => {

    const data2 = siData.graphics.controllers
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
  }, []);

  return (
    <>
      <Descriptions className='custom-descriptions' column={2} title="Graphics Info" bordered items={graphicsinfo} />
    </>
  )
}

export default Graphics
