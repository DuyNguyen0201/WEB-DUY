import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Space } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  DashboardOutlined, 
  UserOutlined, 
  BankOutlined, 
  FormOutlined, 
  FolderOpenOutlined, 
  CheckCircleOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import { AppLogo } from "../components/common/AppLogo";
import { useAuthStore } from "../stores/auth.store";

const { Header, Sider, Content } = Layout;

export const CandidateLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "/candidate/dashboard", icon: <DashboardOutlined />, label: "Bảng điều khiển" },
    { key: "/candidate/profile", icon: <UserOutlined />, label: "Thông tin cá nhân" },
    { key: "/candidate/universities", icon: <BankOutlined />, label: "Danh sách trường" },
    { key: "/candidate/apply", icon: <FormOutlined />, label: "Nộp hồ sơ" },
    { key: "/candidate/applications", icon: <FolderOpenOutlined />, label: "Hồ sơ của tôi" },
    { key: "/candidate/results", icon: <CheckCircleOutlined />, label: "Kết quả xét tuyển" },
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Hồ sơ",
        onClick: () => navigate("/candidate/profile")
      },
      { type: "divider" as const },
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
        theme="light"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
          <AppLogo collapsed={collapsed} />
        </div>
        <Menu 
          theme="light" 
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
