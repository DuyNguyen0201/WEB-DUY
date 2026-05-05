import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onFinish = async (values: any) => {
    setLoading(true);
    const { email, password } = values;
    
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      message.success(result.message);
      // Let routing handle redirect based on role or we can do it here
      const state = useAuthStore.getState();
      if (state.currentUser?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (state.currentUser?.role === "candidate") {
        navigate("/candidate/dashboard");
      }
    } else {
      message.error(result.message);
    }
  };

  return (
    <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Title level={3}>Đăng nhập</Title>
        <Text type="secondary">Vui lòng đăng nhập để tiếp tục</Text>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item 
          label="Email" 
          name="email" 
          rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
        >
          <Input placeholder="Nhập email của bạn" />
        </Form.Item>

        <Form.Item 
          label="Mật khẩu" 
          name="password" 
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </div>
      
      <Divider />
      
      <div style={{ background: "#f0f5ff", padding: "16px", borderRadius: "8px", border: "1px solid #adc6ff" }}>
        <Text strong style={{ color: "#1677ff", display: "block", marginBottom: 8 }}>Tài khoản Demo:</Text>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Quản trị viên:</Text>
            <Text strong copyable>admin@example.com / 123456</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Thí sinh:</Text>
            <Text strong copyable>candidate@example.com / 123456</Text>
          </div>
        </div>
      </div>
    </Card>
  );
};
