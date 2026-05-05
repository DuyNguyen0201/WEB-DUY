import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

const { Title, Text } = Typography;

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const onFinish = async (values: any) => {
    setLoading(true);
    const { email, password } = values;
    
    const result = await register(email, password);
    setLoading(false);
    
    if (result.success) {
      message.success(result.message);
      navigate("/login");
    } else {
      message.error(result.message);
    }
  };

  return (
    <Card style={{ width: 450, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Title level={3}>Đăng ký thí sinh</Title>
        <Text type="secondary">Tạo tài khoản để nộp hồ sơ xét tuyển</Text>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item 
          label="Họ và tên" 
          name="fullName" 
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item 
          label="Email" 
          name="email" 
          rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
        >
          <Input placeholder="Nhập email của bạn" />
        </Form.Item>
        
        <Form.Item 
          label="Số điện thoại" 
          name="phone" 
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item 
          label="Mật khẩu" 
          name="password" 
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password placeholder="Tạo mật khẩu" />
        </Form.Item>
        
        <Form.Item 
          label="Xác nhận mật khẩu" 
          name="confirmPassword" 
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
      </div>
    </Card>
  );
};
