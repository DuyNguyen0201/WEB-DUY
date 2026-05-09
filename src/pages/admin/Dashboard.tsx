import React, { useMemo, useState } from "react";
import { Card, Statistic, Row, Col, Table, Typography, Button, Progress, Tag, Select, Space } from "antd";
import { 
  TeamOutlined, 
  BankOutlined, 
  BookOutlined, 
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useApplicationStore } from "../../stores/application.store";
import { useAdmissionRoundStore } from "../../stores/admissionRound.store";
import { formatDate } from "../../utils/date";

const { Title } = Typography;
const { Option } = Select;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { candidates, getCandidateById } = useCandidateStore();
  const { universities, getUniversityById } = useUniversityStore();
  const { majors, getMajorById } = useMajorStore();
  const { applications } = useApplicationStore();
  const { admissionRounds } = useAdmissionRoundStore();

  const [selectedAdmissionRoundId, setSelectedAdmissionRoundId] = useState<string>("all");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("all");

  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const safeMajors = Array.isArray(majors) ? majors : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeAdmissionRounds = Array.isArray(admissionRounds) ? admissionRounds : [];

  const filteredApplications = useMemo(() => {
    return safeApplications.filter(app => {
      const matchRound = selectedAdmissionRoundId === "all" || app.admissionRoundId === selectedAdmissionRoundId;
      const matchUni = selectedUniversityId === "all" || app.universityId === selectedUniversityId;
      return matchRound && matchUni;
    });
  }, [safeApplications, selectedAdmissionRoundId, selectedUniversityId]);

  const stats = useMemo(() => {
    return {
      total: filteredApplications.length,
      pending: filteredApplications.filter(a => a.status === 'pending').length,
      approved: filteredApplications.filter(a => a.status === 'approved').length,
      rejected: filteredApplications.filter(a => a.status === 'rejected').length,
    };
  }, [filteredApplications]);

  const latestApplications = useMemo(() => {
    return [...filteredApplications]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 8);
  }, [filteredApplications]);

  const percentPending = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const percentApproved = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
  const percentRejected = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;

  const universityStats = useMemo(() => {
    return safeUniversities.map(uni => {
      const apps = filteredApplications.filter(a => a.universityId === uni.id);
      return {
        id: uni.id,
        name: uni.name,
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      };
    }).sort((a, b) => b.total - a.total).filter(stat => stat.total > 0);
  }, [safeUniversities, filteredApplications]);

  const majorStats = useMemo(() => {
    return safeMajors.map(major => {
      const uni = safeUniversities.find(u => u.id === major.universityId);
      const apps = filteredApplications.filter(a => a.majorId === major.id);
      return {
        id: major.id,
        name: major.name,
        uniName: uni?.name || "Không rõ trường",
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      };
    }).sort((a, b) => b.total - a.total).filter(stat => stat.total > 0);
  }, [safeMajors, safeUniversities, filteredApplications]);

  const admissionRoundStats = useMemo(() => {
    return safeAdmissionRounds.map(round => {
      const apps = filteredApplications.filter(a => a.admissionRoundId === round.id);
      return {
        id: round.id,
        name: `${round.code} - ${round.name}`,
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      };
    }).sort((a, b) => b.total - a.total).filter(stat => stat.total > 0);
  }, [safeAdmissionRounds, filteredApplications]);

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

  const commonStatColumns = [
    { title: "Tổng hồ sơ", dataIndex: "total", key: "total", align: "center" as const, render: (val: number) => <Typography.Text strong>{val}</Typography.Text> },
    { title: "Chờ duyệt", dataIndex: "pending", key: "pending", align: "center" as const, render: (val: number) => <Tag color="warning">{val}</Tag> },
    { title: "Đã duyệt", dataIndex: "approved", key: "approved", align: "center" as const, render: (val: number) => <Tag color="success">{val}</Tag> },
    { title: "Từ chối", dataIndex: "rejected", key: "rejected", align: "center" as const, render: (val: number) => <Tag color="error">{val}</Tag> },
  ];

  return (
    <div>
      <PageHeader 
        title="Bảng điều khiển quản trị" 
        breadcrumbs={[
          { title: "Tổng quan dữ liệu xét tuyển trong hệ thống" }
        ]}
      />

      <Card title={<Space><FilterOutlined /> Bộ lọc thống kê</Space>} style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}><Typography.Text strong>Đợt xét tuyển</Typography.Text></div>
            <Select 
              style={{ width: '100%' }} 
              value={selectedAdmissionRoundId}
              onChange={setSelectedAdmissionRoundId}
            >
              <Option value="all">Tất cả đợt xét tuyển</Option>
              {safeAdmissionRounds.map(round => (
                <Option key={round.id} value={round.id}>
                  {round.code} - {round.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}><Typography.Text strong>Trường đại học</Typography.Text></div>
            <Select 
              style={{ width: '100%' }} 
              value={selectedUniversityId}
              onChange={setSelectedUniversityId}
            >
              <Option value="all">Tất cả trường</Option>
              {safeUniversities.map(uni => (
                <Option key={uni.id} value={uni.id}>
                  {uni.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setSelectedAdmissionRoundId("all");
                setSelectedUniversityId("all");
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>Tổng thí sinh</span>}
              value={safeCandidates.length} 
              prefix={
                <div style={{ background: "linear-gradient(135deg, #e0c3fc, #8ec5fc)", padding: "10px", borderRadius: "12px", display: "inline-flex", marginRight: "8px" }}>
                  <TeamOutlined style={{ color: "#2563eb", fontSize: "20px" }} />
                </div>
              }
              valueStyle={{ fontWeight: 800, fontSize: "28px", color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>Tổng trường</span>}
              value={safeUniversities.length} 
              prefix={
                <div style={{ background: "linear-gradient(135deg, #fbc2eb, #a6c1ee)", padding: "10px", borderRadius: "12px", display: "inline-flex", marginRight: "8px" }}>
                  <BankOutlined style={{ color: "#7c3aed", fontSize: "20px" }} />
                </div>
              }
              valueStyle={{ fontWeight: 800, fontSize: "28px", color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>Tổng ngành</span>}
              value={safeMajors.length} 
              prefix={
                <div style={{ background: "linear-gradient(135deg, #a1c4fd, #c2e9fb)", padding: "10px", borderRadius: "12px", display: "inline-flex", marginRight: "8px" }}>
                  <BookOutlined style={{ color: "#0284c7", fontSize: "20px" }} />
                </div>
              }
              valueStyle={{ fontWeight: 800, fontSize: "28px", color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>Tổng hồ sơ</span>}
              value={stats.total} 
              prefix={
                <div style={{ background: "linear-gradient(135deg, #f6d365, #fda085)", padding: "10px", borderRadius: "12px", display: "inline-flex", marginRight: "8px" }}>
                  <FileTextOutlined style={{ color: "#ea580c", fontSize: "20px" }} />
                </div>
              }
              valueStyle={{ fontWeight: 800, fontSize: "28px", color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>Chờ duyệt</span>}
              value={stats.pending} 
              prefix={
                <div style={{ background: "linear-gradient(135deg, #fdfbfb, #ebedee)", padding: "10px", borderRadius: "12px", display: "inline-flex", marginRight: "8px" }}>
                  <ClockCircleOutlined style={{ color: "#ca8a04", fontSize: "20px" }} />
                </div>
              }
              valueStyle={{ fontWeight: 800, fontSize: "28px", color: "#eab308" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>Đã duyệt</span>}
              value={stats.approved} 
              prefix={
                <div style={{ background: "linear-gradient(135deg, #d4fc79, #96e6a1)", padding: "10px", borderRadius: "12px", display: "inline-flex", marginRight: "8px" }}>
                  <CheckCircleOutlined style={{ color: "#16a34a", fontSize: "20px" }} />
                </div>
              }
              valueStyle={{ fontWeight: 800, fontSize: "28px", color: "#22c55e" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>Từ chối</span>}
              value={stats.rejected} 
              prefix={
                <div style={{ background: "linear-gradient(135deg, #ff9a9e, #fecfef)", padding: "10px", borderRadius: "12px", display: "inline-flex", marginRight: "8px" }}>
                  <CloseCircleOutlined style={{ color: "#dc2626", fontSize: "20px" }} />
                </div>
              }
              valueStyle={{ fontWeight: 800, fontSize: "28px", color: "#ef4444" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title={<Title level={5} style={{ margin: 0 }}>Thống kê hồ sơ theo trạng thái</Title>} bordered={false} style={{ height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Typography.Text>Chờ duyệt</Typography.Text>
                <Typography.Text strong>{stats.pending} ({percentPending.toFixed(1)}%)</Typography.Text>
              </div>
              <Progress percent={percentPending} strokeColor="#faad14" showInfo={false} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Typography.Text>Đã duyệt</Typography.Text>
                <Typography.Text strong>{stats.approved} ({percentApproved.toFixed(1)}%)</Typography.Text>
              </div>
              <Progress percent={percentApproved} strokeColor="#52c41a" showInfo={false} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Typography.Text>Từ chối</Typography.Text>
                <Typography.Text strong>{stats.rejected} ({percentRejected.toFixed(1)}%)</Typography.Text>
              </div>
              <Progress percent={percentRejected} strokeColor="#ff4d4f" showInfo={false} />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card title={<Title level={5} style={{ margin: 0 }}>Hồ sơ theo trường đại học</Title>} bordered={false} style={{ height: '100%' }}>
            {universityStats.length > 0 ? (
              <Table
                columns={[
                  { title: "Trường", dataIndex: "name", key: "name" },
                  ...commonStatColumns
                ]}
                dataSource={universityStats}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ x: true }}
              />
            ) : (
              <EmptyState description="Không có hồ sơ phù hợp với bộ lọc" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<Title level={5} style={{ margin: 0 }}>Hồ sơ theo ngành học</Title>} bordered={false} style={{ height: '100%' }}>
            {majorStats.length > 0 ? (
              <Table
                columns={[
                  { title: "Ngành", dataIndex: "name", key: "name" },
                  { title: "Trường", dataIndex: "uniName", key: "uniName" },
                  ...commonStatColumns
                ]}
                dataSource={majorStats}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ x: true }}
              />
            ) : (
              <EmptyState description="Không có hồ sơ phù hợp với bộ lọc" />
            )}
          </Card>
        </Col>

        {safeAdmissionRounds.length > 0 && (
          <Col xs={24} lg={12}>
            <Card title={<Title level={5} style={{ margin: 0 }}>Hồ sơ theo đợt xét tuyển</Title>} bordered={false} style={{ height: '100%' }}>
              {admissionRoundStats.length > 0 ? (
                <Table
                  columns={[
                    { title: "Đợt xét tuyển", dataIndex: "name", key: "name" },
                    ...commonStatColumns
                  ]}
                  dataSource={admissionRoundStats}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                  scroll={{ x: true }}
                />
              ) : (
                <EmptyState description="Không có hồ sơ phù hợp với bộ lọc" />
              )}
            </Card>
          </Col>
        )}
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
          <EmptyState description="Không có hồ sơ phù hợp với bộ lọc" />
        )}
      </Card>
    </div>
  );
};
