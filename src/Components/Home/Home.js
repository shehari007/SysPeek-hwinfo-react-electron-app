import React from 'react';
import { Card, Typography, Button, Space, Tag } from 'antd';

const { ipcRenderer } = window.require('electron');

const Home = ({ children }) => {
    const urlToOpenProf = `https://github.com/shehari007`;
    const urlToOpenRepos = `https://github.com/shehari007?tab=repositories`;
    const urlToOpenElectro = `https://github.com/shehari007/SysPeek-hwinfo-react-electron-app`;

    const handleLinkClick = (type) => {
        if (type === 'profile') {
            ipcRenderer.send('open-external-link', urlToOpenProf);
        } else if (type === 'project') {
            ipcRenderer.send('open-external-link', urlToOpenElectro);
        } else if (type === 'repos') {
            ipcRenderer.send('open-external-link', urlToOpenRepos);
        }
    };

    return (
        <div className="home-shell">
            <Card className="hero-card" bordered={false}>
                <div className="hero-content">
                    <div className="hero-meta">
                        <Tag color="geekblue">Electron + React</Tag>
                        <Typography.Title level={2} className="hero-title">SysPeek System Information Viewer</Typography.Title>
                        <Typography.Paragraph className="hero-sub">
                            Modern desktop dashboard delivering live, trusted hardware insights with zero fuss.
                        </Typography.Paragraph>
                        <Space size="middle" wrap>
                            <Button type="primary" onClick={() => handleLinkClick('project')}>View Project</Button>
                            <Button onClick={() => handleLinkClick('profile')}>Author</Button>
                            <Button onClick={() => handleLinkClick('repos')}>More Repos</Button>
                        </Space>
                    </div>
                    <div className="hero-logo">
                        <img src='logo192.png' height={150} width={150} alt='logo' />
                    </div>
                </div>
            </Card>

            {children && (
                <div className="home-preview">
                    <Typography.Title level={4}>Quick Snapshot</Typography.Title>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Home;
