import React, { useState, useMemo } from "react";
import { Card, Table, Input, Select, Tag, Button, Modal, Descriptions, Typography } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { useNotificationLogStore } from "../../stores/notificationLog.store";
import { 
  getNotificationTypeLabel, 
  getNotificationChannelLabel, 
  getNotificationStatusLabel 
} from "../../constants/notifications";
import { formatDateTime } from "../../utils/date";
import type { NotificationLog, NotificationType, NotificationChannel, NotificationStatus } from "../../types/notification.types";

const { Text } = Typography;
const { Option } = Select;

export const NotificationLogList: React.FC = () => {
  const { notificationLogs } = useNotificationLogStore();

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  const safeLogs = Array.isArray(notificationLogs) ? notificationLogs : [];

  const filteredLogs = useMemo(() => {
    return safeLogs
      .filter((log) => {
        // Type filter
        if (typeFilter !== "all" && log.type !== typeFilter) return false;

        // Channel filter
        if (channelFilter !== "all" && log.channel !== channelFilter) return false;

        // Status filter
        if (statusFilter !== "all" && log.status !== statusFilter) return false;

        // Search text
        if (searchText.trim()) {
          const lowerSearch = searchText.toLowerCase().trim();
          const matchName = (log.recipientName || "").toLowerCase().includes(lowerSearch);
          const matchEmail = (log.recipientEmail || "").toLowerCase().includes(lowerSearch);
          const matchSubject = (log.subject || "").toLowerCase().includes(lowerSearch);
          const matchContent = (log.content || "").toLowerCase().includes(lowerSearch);
          const matchAppId = (log.applicationId || "").toLowerCase().includes(lowerSearch);
          
          if (!matchName && !matchEmail && !matchSubject && !matchContent && !matchAppId) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [safeLogs, searchText, typeFilter, channelFilter, statusFilter]);

  const handleViewDetail = (log: NotificationLog) => {
    setSelectedLog(log);
    setIsModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "green";
      case "pending": return "orange";
      case "failed": return "red";
      default: return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "application_approved": return "success";
      case "application_rejected": return "error";
      case "application_submitted": return "processing";
      case "system": return "default";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => date ? formatDateTime(date) : "Chưa cập nhật",
    },
    {
      title: "Người nhận",
      dataIndex: "recipientName",
      key: "recipientName",
      render: (text: string) => <Text strong>{text || "Chưa cập nhật"}</Text>,
    },
    {
      title: "Email",
      dataIndex: "recipientEmail",
      key: "recipientEmail",
      render: (text: string) => text || "Chưa cập nhật",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: NotificationType) => (
        <Tag color={getTypeColor(type)}>{getNotificationTypeLabel(type)}</Tag>
      ),
    },
    {
      title: "Kênh",
      dataIndex: "channel",
      key: "channel",
      render: (channel: NotificationChannel) => (
        <Tag color={channel === "email" ? "geekblue" : "purple"}>
          {getNotificationChannelLabel(channel)}
        </Tag>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "subject",
      key: "subject",
      render: (text: string) => (
        <div style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {text || "Chưa cập nhật"}
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: NotificationStatus) => (
        <Tag color={getStatusColor(status)}>{getNotificationStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: NotificationLog) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      ),
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Lịch sử thông báo" 
        breadcrumbs={[{ title: "Quản lý hệ thống" }, { title: "Lịch sử thông báo" }]}
      />
      <Text type="secondary" style={{ display: 'block', marginBottom: 24, marginTop: -16 }}>
        Theo dõi các thông báo và email giả lập đã được tạo trong hệ thống
      </Text>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên, email, tiêu đề..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
          <Select
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as NotificationType | "all")}
            style={{ width: 200 }}
          >
            <Option value="all">Tất cả loại</Option>
            <Option value="application_submitted">Hồ sơ đã nộp</Option>
            <Option value="application_approved">Hồ sơ được duyệt</Option>
            <Option value="application_rejected">Hồ sơ bị từ chối</Option>
            <Option value="system">Hệ thống</Option>
          </Select>
          <Select
            value={channelFilter}
            onChange={(value) => setChannelFilter(value as NotificationChannel | "all")}
            style={{ width: 200 }}
          >
            <Option value="all">Tất cả kênh</Option>
            <Option value="email">Email</Option>
            <Option value="in_app">Thông báo trong hệ thống</Option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as NotificationStatus | "all")}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="sent">Đã gửi</Option>
            <Option value="pending">Chờ gửi</Option>
            <Option value="failed">Gửi thất bại</Option>
          </Select>
        </div>
      </Card>

      <Card>
        {filteredLogs.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey={(record) => record.id || Math.random().toString()}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} thông báo`
            }}
            scroll={{ x: true }}
          />
        ) : (
          <EmptyState description="Không tìm thấy thông báo phù hợp" />
        )}
      </Card>

      <Modal
        title="Chi tiết thông báo"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Thời gian tạo">
              {selectedLog.createdAt ? formatDateTime(selectedLog.createdAt) : "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Người nhận">
              <Text strong>{selectedLog.recipientName || "Chưa cập nhật"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedLog.recipientEmail || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Loại thông báo">
              <Tag color={getTypeColor(selectedLog.type)}>{getNotificationTypeLabel(selectedLog.type)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kênh">
              <Tag color={selectedLog.channel === "email" ? "geekblue" : "purple"}>
                {getNotificationChannelLabel(selectedLog.channel)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedLog.status)}>{getNotificationStatusLabel(selectedLog.status)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Hồ sơ liên kết">
              {selectedLog.applicationId ? (
                <Text code>{selectedLog.applicationId}</Text>
              ) : (
                <Text type="secondary">Không liên kết hồ sơ</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tiêu đề">
              <Text strong>{selectedLog.subject || "Chưa cập nhật"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              <div style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
                {selectedLog.content || "Chưa cập nhật"}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};
