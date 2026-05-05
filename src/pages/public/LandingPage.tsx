import React from "react";
import { Typography, Button, Space, Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { RocketOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ padding: "60px 20px" }}>
        <Title level={1} style={{ fontSize: "2.5rem", marginBottom: 24, color: "#1677ff" }}>
          Hệ thống Quản lý Xét tuyển Đại học Trực tuyến
        </Title>
        <Paragraph style={{ fontSize: 18, color: "#595959", maxWidth: 700, margin: "0 auto 32px" }}>
          Nền tảng giúp thí sinh dễ dàng tra cứu thông tin trường, ngành và nộp hồ sơ xét tuyển nhanh chóng, minh bạch.
        </Paragraph>
        <Space size="middle">
          <Button type="primary" size="large" onClick={() => navigate("/register")} style={{ padding: "0 32px" }}>
            Bắt đầu đăng ký
          </Button>
          <Button size="large" onClick={() => navigate("/login")} style={{ padding: "0 32px" }}>
            Đăng nhập
          </Button>
        </Space>
      </div>
      
      <div style={{ marginTop: 20, padding: "0 20px" }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: "100%", borderRadius: 12 }}>
              <RocketOutlined style={{ fontSize: 36, color: "#1677ff", marginBottom: 16 }} />
              <Title level={4}>Tiện lợi</Title>
              <Paragraph type="secondary">Nộp hồ sơ mọi lúc, mọi nơi chỉ với một chiếc điện thoại hoặc máy tính có kết nối Internet.</Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: "100%", borderRadius: 12 }}>
              <SafetyCertificateOutlined style={{ fontSize: 36, color: "#52c41a", marginBottom: 16 }} />
              <Title level={4}>Minh bạch</Title>
              <Paragraph type="secondary">Toàn bộ quy trình nộp và xét duyệt hồ sơ đều được theo dõi rõ ràng, bảo vệ quyền lợi tối đa cho thí sinh.</Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: "100%", borderRadius: 12 }}>
              <ThunderboltOutlined style={{ fontSize: 36, color: "#faad14", marginBottom: 16 }} />
              <Title level={4}>Nhanh chóng</Title>
              <Paragraph type="secondary">Xử lý hồ sơ tự động hóa cao, mang lại kết quả xét tuyển trong thời gian ngắn nhất.</Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
