import { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Space, Button, Image, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { meetingRoomApi } from '@/services/meetingRoomApi';
import { MeetingRoom } from '@/types/meetingRoom';
import { useMeetingRoomStore } from '@/stores/meetingRoom';

export default function MeetingRoomDetail() {
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState<MeetingRoom | null>(null);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const { setCurrentRoom } = useMeetingRoomStore();

  const toProxyUrl = (url: string) => `/api/upload/proxy?url=${encodeURIComponent(url)}`;
  const getImageSrc = (url: string) => {
    if (!url) return '';
    return toProxyUrl(url);
  };

  useEffect(() => {
    if (id) {
      fetchMeetingRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMeetingRoom = async () => {
    try {
      setLoading(true);
      const response = await meetingRoomApi.getById(id!);
      if (response.success) {
        setRoom(response.data);
        setCurrentRoom(response.data);
      }
    } catch (error: any) {
      // 错误处理已在API服务中完成
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      AVAILABLE: 'green',
      OCCUPIED: 'red',
      MAINTENANCE: 'orange',
      DISABLED: 'gray',
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      AVAILABLE: '可用',
      OCCUPIED: '占用',
      MAINTENANCE: '维护',
      DISABLED: '禁用',
    };
    return textMap[status] || status;
  };

  if (!room) {
    return null;
  }

  return (
    <div className="p-6">
      <Card loading={loading}>
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">会议室详情</h1>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/rooms/${id}/edit`)}
            >
              编辑
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/rooms')}
            >
              返回列表
            </Button>
          </Space>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="会议室名称" span={2}>
            {room.name}
          </Descriptions.Item>
          <Descriptions.Item label="会议室编号">
            {room.code}
          </Descriptions.Item>
          <Descriptions.Item label="容量">
            {room.capacity}人
          </Descriptions.Item>
          <Descriptions.Item label="位置">
            {room.location}
          </Descriptions.Item>
          <Descriptions.Item label="楼层">
            {room.floor || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(room.status)}>
              {getStatusText(room.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="最小预订时长">
            {room.minDuration ? `${room.minDuration}分钟` : '无限制'}
          </Descriptions.Item>
          <Descriptions.Item label="最大预订时长">
            {room.maxDuration ? `${room.maxDuration}分钟` : '无限制'}
          </Descriptions.Item>
          <Descriptions.Item label="需要审批">
            {room.needApproval ? '是' : '否'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(room.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(room.updatedAt).toLocaleString()}
          </Descriptions.Item>
          {room.description && (
            <Descriptions.Item label="描述" span={2}>
              {room.description}
            </Descriptions.Item>
          )}
        </Descriptions>

        {room.equipment && room.equipment.length > 0 && (
          <>
            <Divider orientation="left">设备信息</Divider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {room.equipment.map((equipment, index) => (
                <Card key={index} size="small" title={equipment.name}>
                  <p><strong>类型:</strong> {equipment.type}</p>
                  {equipment.description && (
                    <p><strong>描述:</strong> {equipment.description}</p>
                  )}
                  <p><strong>状态:</strong> 
                    <Tag color={equipment.available ? 'green' : 'red'}>
                      {equipment.available ? '可用' : '不可用'}
                    </Tag>
                  </p>
                </Card>
              ))}
            </div>
          </>
        )}

        {room.images && room.images.length > 0 && (
          <>
            <Divider orientation="left">会议室图片</Divider>
            <Image.PreviewGroup>
              <Space size="large" wrap>
                {room.images.map((image, index) => (
                  <Image
                    key={index}
                    width={200}
                    height={150}
                    src={getImageSrc(image.url)}
                    alt={image.name}
                    className="object-cover rounded"
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          </>
        )}

        {room.bookingRules && (
          <>
            <Divider orientation="left">预订规则</Divider>
            <Descriptions bordered column={2}>
              {room.bookingRules.advanceBookingDays && (
                <Descriptions.Item label="提前预订天数">
                  {room.bookingRules.advanceBookingDays}天
                </Descriptions.Item>
              )}
              {room.bookingRules.minAdvanceMinutes && (
                <Descriptions.Item label="最小提前时间">
                  {room.bookingRules.minAdvanceMinutes}分钟
                </Descriptions.Item>
              )}
              {room.bookingRules.maxAdvanceMinutes && (
                <Descriptions.Item label="最大提前时间">
                  {room.bookingRules.maxAdvanceMinutes}分钟
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </Card>
    </div>
  );
}
