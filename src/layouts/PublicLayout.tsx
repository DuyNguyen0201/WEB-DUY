import React from "react";
import { Layout, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppLogo } from "../components/common/AppLogo";

const { Header, Content, Footer } = Layout;

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "0 50px", borderBottom: "1px solid #f0f0f0" }}>
        <AppLogo />
        <div style={{ display: "flex", gap: "12px" }}>
          {!isLogin && (
            <Button type="default" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          )}
          {!isRegister && (
            <Button type="primary" onClick={() => navigate("/register")}>
              Đăng ký
            </Button>
          )}
        </div>
      </Header>
      
      <Content style={{ padding: "50px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Outlet />
        </div>
      </Content>
      
      <Footer style={{ textAlign: "center", color: "#8c8c8c" }}>
        Hệ thống Quản lý Xét tuyển Đại học ©{new Date().getFullYear()} Created by Student Team
      </Footer>
    </Layout>
  );
};
