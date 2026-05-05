import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Table, Alert } from "antd";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { formatDate } from "../../utils/date";

export const CandidateDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { getApplicationsByCandidateId } = useApplicationStore();
  const { universities } = useUniversityStore();
  const { majors } = useMajorStore();

  const candidate = useMemo(() => {
    if (!currentUser) return null;
    return getCandidateByUserId(currentUser.id);
  }, [currentUser, getCandidateByUserId]);

  const applications = useMemo(() => {
    if (!candidate) return [];
    return getApplicationsByCandidateId(candidate.id);
  }, [candidate, getApplicationsByCandidateId]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === "pending").length,
      approved: applications.filter(a => a.status === "approved").length,
      rejected: applications.filter(a => a.status === "rejected").length,
    };
  }, [applications]);

  const getUniversityName = (id: string) => {
    return universities.find(u => u.id === id)?.name || "N/A";
  };

  const getMajorName = (id: string) => {
    return majors.find(m => m.id === id)?.name || "N/A";
  };

  const columns = [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationCode",
      key: "applicationCode",
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: "Trường",
      dataIndex: "universityId",
      key: "universityId",
      render: (id: string) => getUniversityName(id)
    },
    {
      title: "Ngành",
      dataIndex: "majorId",
      key: "majorId",
      render: (id: string) => getMajorName(id)
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: any) => <ApplicationStatusTag status={status} />
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => formatDate(date)
    }
  ];

  return (
    <div>
      <PageHeader title="Bảng điều khiển" />
      
      {!candidate && (
        <Alert 
          message="Chưa cập nhật thông tin cá nhân" 
          description="Vui lòng cập nhật thông tin cá nhân của bạn trong phần Thông tin cá nhân trước khi nộp hồ sơ." 
          type="warning" 
          showIcon 
          style={{ marginBottom: 24 }}
        />
      )}

      <Card style={{ marginBottom: 24 }}>
        <h3>Xin chào, {currentUser?.fullName}!</h3>
        <p>Chào mừng bạn đến với hệ thống xét tuyển đại học trực tuyến.</p>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng hồ sơ đã nộp" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Đang chờ duyệt" value={stats.pending} valueStyle={{ color: "#faad14" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Đã duyệt" value={stats.approved} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Từ chối" value={stats.rejected} valueStyle={{ color: "#ff4d4f" }} />
          </Card>
        </Col>
      </Row>

      <Card title="Hồ sơ gần đây">
        {applications.length > 0 ? (
          <Table 
            dataSource={applications} 
            columns={columns} 
            rowKey="id" 
            pagination={false}
            scroll={{ x: true }}
          />
        ) : (
          <EmptyState description="Bạn chưa nộp hồ sơ nào" />
        )}
      </Card>
    </div>
  );
};
