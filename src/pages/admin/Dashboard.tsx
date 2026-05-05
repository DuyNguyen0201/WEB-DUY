import React, { useMemo } from "react";
import { Card, Statistic, Row, Col, Table, Typography, Button } from "antd";
import { 
  TeamOutlined, 
  BankOutlined, 
  BookOutlined, 
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useApplicationStore } from "../../stores/application.store";
import { formatDate } from "../../utils/date";

const { Title } = Typography;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { candidates } = useCandidateStore();
  const { universities } = useUniversityStore();
  const { majors } = useMajorStore();
  const { applications, getApplicationStats } = useApplicationStore();
  
  const { getCandidateById } = useCandidateStore();
  const { getUniversityById } = useUniversityStore();
  const { getMajorById } = useMajorStore();

  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeApplications = Array.isArray(applications) ? applications : [];

  const stats = useMemo(() => {
    return getApplicationStats();
  }, [getApplicationStats, applications]);

  const latestApplications = useMemo(() => {
    return [...safeApplications]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 8);
  }, [safeApplications]);

  const columns = [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationCode",
      key: "applicationCode",
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: "Thí sinh",
      dataIndex: "candidateId",
      key: "candidateId",
      render: (id: string) => {
        const candidate = getCandidateById(id);
        return candidate ? candidate.fullName : "Không rõ thí sinh";
      }
    },
    {
      title: "Trường",
      dataIndex: "universityId",
      key: "universityId",
      render: (id: string) => {
        const university = getUniversityById(id);
        return university ? university.name : "Không rõ trường";
      }
    },
    {
      title: "Ngành",
      dataIndex: "majorId",
      key: "majorId",
      render: (id: string) => {
        const major = getMajorById(id);
        return major ? major.name : "Không rõ ngành";
      }
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const,
      render: (score: number) => score?.toFixed(2)
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: any) => <ApplicationStatusTag status={status} />
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => formatDate(date)
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/admin/applications/${record.id}`)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Bảng điều khiển quản trị" 
        breadcrumbs={[
          { title: "Tổng quan dữ liệu xét tuyển trong hệ thống" }
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Tổng thí sinh" 
              value={safeCandidates.length} 
              prefix={<TeamOutlined style={{ color: "#1890ff" }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Tổng trường" 
              value={safeUniversities.length} 
              prefix={<BankOutlined style={{ color: "#722ed1" }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Tổng ngành" 
              value={safeMajors.length} 
              prefix={<BookOutlined style={{ color: "#13c2c2" }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Tổng hồ sơ" 
              value={stats.total} 
              prefix={<FileTextOutlined style={{ color: "#2f54eb" }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Chờ duyệt" 
              value={stats.pending} 
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />} 
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Đã duyệt" 
              value={stats.approved} 
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />} 
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Từ chối" 
              value={stats.rejected} 
              prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />} 
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Card title={<Title level={4} style={{ margin: 0 }}>Hồ sơ mới nhất</Title>} bordered={false}>
        {latestApplications.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={latestApplications} 
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
          />
        ) : (
          <EmptyState description="Chưa có hồ sơ xét tuyển nào" />
        )}
      </Card>
    </div>
  );
};
