import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, Space, Typography } from "antd";
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
  BellOutlined,
  SearchOutlined
} from "@ant-design/icons";

import { useAuthStore } from "../stores/auth.store";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();

  useEffect(() => {
    document.body.classList.add("dashboard-body");
    return () => {
      document.body.classList.remove("dashboard-body");
    };
  }, []);

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
    { key: "/admin/notifications", icon: <BellOutlined />, label: "Trung tâm thông báo" },
    { key: "/admin/admission-rounds", icon: <CalendarOutlined />, label: "Quản lý đợt" },
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
    <>
      {/* Ambient Background Orbs */}
      <div className="ambient-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <Layout style={{ minHeight: "100vh", background: "transparent", position: "relative", zIndex: 1 }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          className="floating-sidebar acrylic-sidebar"
          width={260}
        >
        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#1f2937" }}>
            <div style={{ 
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))", 
              borderRadius: "12px", 
              padding: "8px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <BankOutlined style={{ fontSize: 24, color: "white" }} />
            </div>
            {!collapsed && <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.5px" }}>UniAdmission</span>}
          </div>
        </div>
        <Menu 
          theme="light" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: "none", padding: "0 12px" }}
        />
      </Sider>
      
      <Layout style={{ background: "transparent" }}>
        <Header className="glass-header acrylic-sidebar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px" }}>
          
          {/* Spotlight Search */}
          <div className="global-search-bar">
            <SearchOutlined style={{ color: "#94a3b8", fontSize: "16px" }} />
            <input type="text" placeholder="Tìm kiếm hồ sơ, thí sinh..." />
            <span className="cmd-k-badge">⌘ K</span>
          </div>

          <Dropdown menu={userMenu} placement="bottomRight" arrow>
            <Space style={{ cursor: "pointer", padding: "4px 12px", borderRadius: "30px", transition: "background 0.3s" }} className="hover-bg-gray">
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
              <span style={{ fontWeight: 600, color: "#4b5563" }}>{currentUser?.fullName}</span>
            </Space>
          </Dropdown>
        </Header>
        
        <Content style={{ margin: "24px 16px", display: "flex", flexDirection: "column" }}>
          {/* Welcome Banner */}
          <div style={{ 
            background: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)", 
            borderRadius: "20px", 
            padding: "32px 40px",
            marginBottom: "24px",
            boxShadow: "var(--soft-shadow)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <Title level={3} style={{ color: "#1f2937", margin: 0 }}>Chào ngày mới, {currentUser?.fullName}! 👋</Title>
              <Text style={{ color: "#4b5563", fontSize: "16px" }}>Hôm nay là một ngày tuyệt vời để phê duyệt các hồ sơ tuyển sinh mới.</Text>
            </div>
            {/* Abstract background shapes for banner */}
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", filter: "blur(20px)" }}></div>
            <div style={{ position: "absolute", bottom: "-50px", right: "100px", width: "150px", height: "150px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", filter: "blur(20px)" }}></div>
          </div>

          <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
    </>
  );
};
