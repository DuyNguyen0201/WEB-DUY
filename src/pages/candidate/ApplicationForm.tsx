import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, Form, Select, InputNumber, Button, Upload, 
  Checkbox, Alert, message, Typography, Row, Col, Space,
  Divider, Statistic
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { useAuthStore } from "../../stores/auth.store";
import { useCandidateStore } from "../../stores/candidate.store";
import { useUniversityStore } from "../../stores/university.store";
import { useMajorStore } from "../../stores/major.store";
import { useApplicationStore } from "../../stores/application.store";
import { mockSubjectGroups } from "../../mocks/subjectGroups.mock";
import { calculateTotalScore } from "../../utils/calculate";
import type { Application, EvidenceFile } from "../../types/application.types";
import type { UploadFile } from "antd/es/upload/interface";

const { Text } = Typography;
const { Option } = Select;

export const ApplicationForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultUniversityId = searchParams.get("universityId");

  const { currentUser } = useAuthStore();
  const { getCandidateByUserId } = useCandidateStore();
  const { getActiveUniversities } = useUniversityStore();
  const { getActiveMajorsByUniversityId } = useMajorStore();
  const { applications, createApplication } = useApplicationStore();

  const [selectedUniversityId, setSelectedUniversityId] = useState<string | undefined>(defaultUniversityId || undefined);
  const [selectedMajorId, setSelectedMajorId] = useState<string | undefined>();
  const [selectedSubjectGroupCode, setSelectedSubjectGroupCode] = useState<string | undefined>();
  const [totalScore, setTotalScore] = useState<number>(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const candidate = useMemo(() => {
    if (!currentUser) return null;
    return getCandidateByUserId(currentUser.id);
  }, [currentUser, getCandidateByUserId]);

  const isProfileComplete = useMemo(() => {
    if (!candidate) return false;
    return !!(candidate.citizenId && candidate.phone && candidate.address && candidate.highSchool);
  }, [candidate]);

  const activeUniversities = getActiveUniversities();
  
  const availableMajors = useMemo(() => {
    if (!selectedUniversityId) return [];
    return getActiveMajorsByUniversityId(selectedUniversityId);
  }, [selectedUniversityId, getActiveMajorsByUniversityId]);

  const availableSubjectGroups = useMemo(() => {
    if (!selectedMajorId) return [];
    const major = availableMajors.find(m => m.id === selectedMajorId);
    if (!major) return [];
    
    // Fallback if missing
    const codes = Array.isArray(major.subjectGroupCodes) ? major.subjectGroupCodes : [];
    return mockSubjectGroups.filter(sg => codes.includes(sg.code));
  }, [selectedMajorId, availableMajors]);

  const requiredSubjects = useMemo(() => {
    if (!selectedSubjectGroupCode) return [];
    const group = mockSubjectGroups.find(g => g.code === selectedSubjectGroupCode);
    return group ? group.subjects : [];
  }, [selectedSubjectGroupCode]);

  useEffect(() => {
    if (defaultUniversityId) {
      form.setFieldsValue({ universityId: defaultUniversityId });
    }
  }, [defaultUniversityId, form]);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.universityId) {
      setSelectedUniversityId(changedValues.universityId);
      setSelectedMajorId(undefined);
      setSelectedSubjectGroupCode(undefined);
      form.setFieldsValue({ majorId: undefined, subjectGroupCode: undefined, scores: undefined });
      setTotalScore(0);
    }
    
    if (changedValues.majorId) {
      setSelectedMajorId(changedValues.majorId);
      setSelectedSubjectGroupCode(undefined);
      form.setFieldsValue({ subjectGroupCode: undefined, scores: undefined });
      setTotalScore(0);
    }

    if (changedValues.subjectGroupCode) {
      setSelectedSubjectGroupCode(changedValues.subjectGroupCode);
      form.setFieldsValue({ scores: undefined });
      setTotalScore(0);
    }

    if (changedValues.scores || allValues.scores) {
      const currentScores = allValues.scores || {};
      const scoreObj: any = {};
      requiredSubjects.forEach(sub => {
        if (currentScores[sub] !== undefined) {
          scoreObj[sub] = currentScores[sub];
        }
      });
      setTotalScore(calculateTotalScore(scoreObj));
    }
  };

  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-5);
    setFileList(newFileList);
  };

  const onFinish = (values: any) => {
    if (!candidate) return;

    // Check duplicate
    const isDuplicate = applications.some(
      app => app.candidateId === candidate.id &&
             app.universityId === values.universityId &&
             app.majorId === values.majorId &&
             app.subjectGroupCode === values.subjectGroupCode &&
             (app.status === "pending" || app.status === "approved")
    );

    if (isDuplicate) {
      message.error("Bạn đã nộp một hồ sơ với cùng Trường, Ngành và Tổ hợp này đang chờ duyệt hoặc đã duyệt!");
      return;
    }

    const mockEvidences: EvidenceFile[] = fileList.map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: "#",
      type: file.type === "application/pdf" ? "pdf" : "image",
      size: file.size || 0,
      uploadedAt: new Date().toISOString()
    }));

    const newApp: Application = {
      id: `app_${Date.now()}`,
      applicationCode: `HS${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
      candidateId: candidate.id,
      universityId: values.universityId,
      majorId: values.majorId,
      subjectGroupCode: values.subjectGroupCode,
      scores: values.scores,
      totalScore,
      evidenceFiles: mockEvidences,
      status: "pending",
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    createApplication(newApp);
    message.success("Nộp hồ sơ thành công!");
    navigate("/candidate/applications");
  };

  return (
    <div>
      <PageHeader title="Nộp hồ sơ xét tuyển" />

      {!isProfileComplete && (
        <Alert
          message="Thông tin cá nhân chưa đầy đủ"
          description={
            <Space direction="vertical">
              <Text>Bạn cần cập nhật đầy đủ thông tin cá nhân (CCCD, SĐT, Địa chỉ, Trường THPT) trước khi nộp hồ sơ.</Text>
              <Button type="primary" size="small" onClick={() => navigate("/candidate/profile")}>
                Cập nhật ngay
              </Button>
            </Space>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        {!isProfileComplete ? (
          <EmptyState description="Vui lòng cập nhật thông tin cá nhân để tiếp tục" />
        ) : (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          onFinish={onFinish}
        >
          <Divider />
          <h3>1. Thông tin thí sinh</h3>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Họ và tên">
                <InputNumber disabled style={{ width: "100%" }} value={candidate?.fullName} controls={false} formatter={value => `${value}`} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Số CCCD">
                <InputNumber disabled style={{ width: "100%" }} value={candidate?.citizenId} controls={false} formatter={value => `${value}`} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Email">
                <InputNumber disabled style={{ width: "100%" }} value={candidate?.email} controls={false} formatter={value => `${value}`} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <h3>2. Chọn nguyện vọng</h3>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item 
                name="universityId" 
                label="Trường đại học" 
                rules={[{ required: true, message: "Vui lòng chọn trường đại học" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn trường đại học"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {activeUniversities.map(u => (
                    <Option key={u.id} value={u.id}>{u.code} - {u.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item 
                name="majorId" 
                label="Ngành học" 
                rules={[{ required: true, message: "Vui lòng chọn ngành học" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn ngành học"
                  disabled={!selectedUniversityId}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {availableMajors.map(m => (
                    <Option key={m.id} value={m.id}>{m.code} - {m.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item 
                name="subjectGroupCode" 
                label="Tổ hợp xét tuyển" 
                rules={[{ required: true, message: "Vui lòng chọn tổ hợp" }]}
              >
                <Select
                  placeholder="Chọn tổ hợp"
                  disabled={!selectedMajorId}
                >
                  {availableSubjectGroups.map(sg => (
                    <Option key={sg.code} value={sg.code}>{sg.code} ({sg.name})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedSubjectGroupCode && (
            <>
              <Divider />
              <h3>3. Nhập điểm xét tuyển</h3>
              <Alert 
                message="Lưu ý" 
                description="Vui lòng nhập điểm chính xác (từ 0 đến 10). Điểm sẽ được đối chiếu với học bạ/chứng nhận điểm của bạn." 
                type="info" 
                showIcon 
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                {requiredSubjects.map(subject => {
                  // Map subject code to Vietnamese name for UI
                  const subjectNames: Record<string, string> = {
                    math: "Toán học",
                    physics: "Vật lý",
                    chemistry: "Hóa học",
                    literature: "Ngữ văn",
                    english: "Tiếng Anh",
                    biology: "Sinh học",
                    history: "Lịch sử",
                    geography: "Địa lý",
                    civicEducation: "GDCD"
                  };
                  
                  return (
                    <Col xs={24} sm={8} key={subject}>
                      <Form.Item 
                        name={["scores", subject]} 
                        label={`Điểm ${subjectNames[subject] || subject}`}
                        rules={[
                          { required: true, message: `Vui lòng nhập điểm ${subjectNames[subject] || subject}` }
                        ]}
                      >
                        <InputNumber 
                          min={0} 
                          max={10} 
                          step={0.25} 
                          style={{ width: "100%" }} 
                          placeholder="0.00 - 10.00"
                        />
                      </Form.Item>
                    </Col>
                  );
                })}
              </Row>
              <Row>
                <Col span={24}>
                  <Card size="small" style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}>
                    <Statistic title="Tổng điểm xét tuyển" value={totalScore} precision={2} />
                  </Card>
                </Col>
              </Row>
            </>
          )}

          <Divider />
          <h3>4. Minh chứng đính kèm</h3>
          <Form.Item label="Upload Học bạ / Giấy chứng nhận (Tối đa 5 file, định dạng JPG/PNG/PDF)">
            <Upload
              multiple
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false} // Prevent real upload
              accept="image/png, image/jpeg, application/pdf"
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          <Divider />
          <h3>5. Xác nhận</h3>
          <Form.Item 
            name="confirm" 
            valuePropName="checked"
            rules={[
              { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error("Bạn phải xác nhận thông tin trước khi nộp hồ sơ")) }
            ]}
          >
            <Checkbox>
              Tôi xin cam đoan những thông tin khai báo trên là hoàn toàn chính xác và trung thực. Tôi xin chịu mọi trách nhiệm trước pháp luật nếu có sai sót.
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" size="large" block disabled={!isProfileComplete}>
              Nộp hồ sơ
            </Button>
          </Form.Item>
        </Form>
        )}
      </Card>
    </div>
  );
};
