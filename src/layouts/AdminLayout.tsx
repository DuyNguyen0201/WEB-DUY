import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Space } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  DashboardOutlined, 
  BankOutlined, 
  BookOutlined, 
  TeamOutlined, 
  FolderOpenOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  BellOutlined
} from "@ant-design/icons";

import { useAuthStore } from "../stores/auth.store";

const { Header, Sider, Content } = Layout;

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Bảng điều khiển" },
    { key: "/admin/universities", icon: <BankOutlined />, label: "Quản lý trường" },
    { key: "/admin/majors", icon: <BookOutlined />, label: "Quản lý ngành" },
    { key: "/admin/subject-groups", icon: <AppstoreOutlined />, label: "Quản lý tổ hợp" },
    { key: "/admin/candidates", icon: <TeamOutlined />, label: "Quản lý thí sinh" },
    { key: "/admin/applications", icon: <FolderOpenOutlined />, label: "Quản lý hồ sơ" },
    { key: "/admin/admission-rounds", icon: <CalendarOutlined />, label: "Quản lý đợt xét tuyển" },
    { key: "/admin/notifications", icon: <BellOutlined />, label: "Lịch sử thông báo" },
  ];

  const userMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: handleLogout,
        danger: true
      }
    ]
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
      >
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: "rgba(255, 255, 255, 0.04)" }}>
          {/* We might want a dark theme compatible logo here, but for now we'll use a text workaround or just icon */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white" }}>
            <BankOutlined style={{ fontSize: 24, color: "#1677ff" }} />
            {!collapsed && <span style={{ fontSize: "16px", fontWeight: "bold" }}>Admin Portal</span>}
          </div>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ padding: "0 24px", background: "#fff", display: "flex", justifyContent: "flex-end", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <Dropdown menu={userMenu} placement="bottomRight" arrow>
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <span>{currentUser?.fullName}</span>
            </Space>
          </Dropdown>
        </Header>
        
        <Content style={{ margin: "24px", minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
