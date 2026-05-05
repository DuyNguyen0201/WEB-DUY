import React, { useMemo } from "react";
import { Card, Result, Button, Descriptions, Typography, Tag, Alert, Row, Col, List } from "antd";
import { PageHeader } from "../../components/common/PageHeader";
import { useParams, useNavigate } from "react-router-dom";
import { ApplicationStatusTag } from "../../components/status/ApplicationStatusTag";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useApplicationStore } from "../../stores/application.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { formatDateTime } from "../../utils/date";

const { Title, Text } = Typography;

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { getApplicationById } = useApplicationStore();
  const { getUniversityById } = useUniversityStore();
  const { getMajorById } = useMajorStore();

  const candidate = useMemo(() => {
    if (!currentUser) return null;
    return getCandidateByUserId(currentUser.id);
  }, [currentUser, getCandidateByUserId]);

  const application = useMemo(() => {
    if (!id) return undefined;
    return getApplicationById(id);
  }, [id, getApplicationById]);

  if (!candidate || !application || application.candidateId !== candidate.id) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Result
            status="404"
            title="Hồ sơ không tồn tại"
            subTitle="Hồ sơ bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập."
            extra={<Button type="primary" onClick={() => navigate("/candidate/applications")}>Quay lại danh sách</Button>}
          />
        </Card>
      </div>
    );
  }

  const university = getUniversityById(application.universityId);
  const major = getMajorById(application.majorId);

  const subjectNames: Record<string, string> = {
    math: "Toán học",
    physics: "Vật lý",
    chemistry: "Hóa học",
    literature: "Ngữ văn",
    english: "Tiếng Anh",
    biology: "Sinh học",
    history: "Lịch sử",
    geography: "Địa lý",
    civicEducation: "Giáo dục công dân"
  };

  return (
    <div>
      <PageHeader 
        title="Chi tiết hồ sơ xét tuyển" 
        breadcrumbs={[
          { title: "Hồ sơ của tôi", href: "/candidate/applications" }, 
          { title: application.applicationCode }
        ]}
      />

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>Mã hồ sơ: {application.applicationCode}</Title>
                <Text type="secondary">Đã nộp vào: {formatDateTime(application.submittedAt)}</Text>
              </div>
              <div>
                <ApplicationStatusTag status={application.status} />
              </div>
            </div>

            {application.status === "rejected" && application.adminNote && (
              <Alert 
                message="Lý do từ chối" 
                description={application.adminNote} 
                type="error" 
                showIcon 
                style={{ marginBottom: 24 }} 
              />
            )}

            {application.status === "approved" && (
              <Alert 
                message="Chúc mừng bạn đã trúng tuyển!" 
                description={application.adminNote || "Hồ sơ của bạn đã được duyệt thành công."} 
                type="success" 
                showIcon 
                style={{ marginBottom: 24 }} 
              />
            )}

            <Descriptions title="Thông tin thí sinh" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Họ và tên">{candidate.fullName}</Descriptions.Item>
              <Descriptions.Item label="Số CCCD">{candidate.citizenId}</Descriptions.Item>
              <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{candidate.phone}</Descriptions.Item>
              <Descriptions.Item label="Trường THPT" span={2}>{candidate.highSchool}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="Thông tin nguyện vọng" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Trường đại học" span={2}>
                <Text strong>{university?.name || "N/A"}</Text> ({university?.code})
              </Descriptions.Item>
              <Descriptions.Item label="Ngành học" span={2}>
                <Text strong>{major?.name || "N/A"}</Text> ({major?.code})
              </Descriptions.Item>
              <Descriptions.Item label="Tổ hợp xét tuyển">
                <Tag color="blue">{application.subjectGroupCode}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng điểm xét tuyển">
                <Text type="danger" strong>{application.totalScore.toFixed(2)}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Điểm thành phần</Title>
            <Card type="inner" style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                {Object.entries(application.scores || {}).map(([subject, score]) => (
                  <Col xs={12} sm={8} md={6} key={subject}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <Text type="secondary">{subjectNames[subject] || subject}</Text>
                      <Text strong style={{ fontSize: 16 }}>{score !== undefined ? score.toFixed(2) : "-"}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            <Title level={5}>Minh chứng đính kèm</Title>
            {application.evidenceFiles && application.evidenceFiles.length > 0 ? (
              <List
                bordered
                dataSource={application.evidenceFiles}
                renderItem={(file) => (
                  <List.Item>
                    <Typography.Text mark>[{file.type.toUpperCase()}]</Typography.Text> {file.name}
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">Không có minh chứng nào được đính kèm.</Text>
            )}

            {application.candidateNote && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Ghi chú của thí sinh</Title>
                <Card type="inner">
                  <Text>{application.candidateNote}</Text>
                </Card>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
