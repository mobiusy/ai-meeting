import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message, Upload, Row, Col, Space } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { meetingRoomApi } from '@/services/meetingRoomApi';
import { uploadApi } from '@/services/uploadApi';
import { CreateMeetingRoomData, UpdateMeetingRoomData, Equipment, Image } from '@/types/meetingRoom';
import { useMeetingRoomStore } from '@/stores/meetingRoom';

const { TextArea } = Input;
const { Option } = Select;

export default function MeetingRoomForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [imageList, setImageList] = useState<Image[]>([]);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { addRoom, updateRoom } = useMeetingRoomStore();

  useEffect(() => {
    if (isEdit) {
      fetchMeetingRoom();
    }
  }, [id, isEdit]);

  const fetchMeetingRoom = async () => {
    try {
      setLoading(true);
      const response = await meetingRoomApi.getById(id!);
      if (response.success) {
        const room = response.data;
        form.setFieldsValue({
          name: room.name,
          code: room.code,
          capacity: room.capacity,
          location: room.location,
          floor: room.floor,
          description: room.description,
          status: room.status,
          minDuration: room.minDuration,
          maxDuration: room.maxDuration,
          needApproval: room.needApproval,
        });
        setEquipmentList(room.equipment || []);
        setImageList(room.images || []);
      }
    } catch (error: any) {
      message.error('获取会议室信息失败');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      setLoading(true);
      const data: CreateMeetingRoomData | UpdateMeetingRoomData = {
        ...values,
        equipment: equipmentList,
        images: imageList,
      };

      if (isEdit) {
        const response = await meetingRoomApi.update(id!, data);
        if (response.success) {
          updateRoom(id!, response.data);
          message.success('会议室更新成功');
        }
      } else {
        const createData: CreateMeetingRoomData = {
          name: data.name,
          code: data.code,
          capacity: data.capacity,
          location: data.location,
          floor: data.floor,
          description: data.description,
          equipment: data.equipment,
          images: data.images,
          bookingRules: data.bookingRules,
          minDuration: data.minDuration,
          maxDuration: data.maxDuration,
          needApproval: data.needApproval,
        };
        const response = await meetingRoomApi.create(createData);
        if (response.success) {
          addRoom(response.data);
          message.success('会议室创建成功');
        }
      }
      
      navigate('/rooms');
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const response = await uploadApi.uploadImage(file);
      if (response.success) {
        const newImage: Image = {
          url: response.data.url,
          name: file.name,
          size: file.size,
          type: file.type,
        };
        setImageList([...imageList, newImage]);
        message.success('图片上传成功');
      }
    } catch (error: any) {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
    return false; // 阻止默认上传行为
  };

  const removeImage = (index: number) => {
    setImageList(imageList.filter((_, i) => i !== index));
  };

  const addEquipment = () => {
    const newEquipment: Equipment = {
      name: '',
      type: 'other',
      description: '',
      available: true,
    };
    setEquipmentList([...equipmentList, newEquipment]);
  };

  const updateEquipment = (index: number, field: keyof Equipment, value: string | boolean) => {
    const updated = [...equipmentList];
    updated[index] = { ...updated[index], [field]: value };
    setEquipmentList(updated);
  };

  const removeEquipment = (index: number) => {
    setEquipmentList(equipmentList.filter((_, i) => i !== index));
  };

  const equipmentTypes = [
    { value: 'projector', label: '投影仪' },
    { value: 'screen', label: '投影幕' },
    { value: 'whiteboard', label: '白板' },
    { value: 'tv', label: '电视' },
    { value: 'camera', label: '摄像头' },
    { value: 'microphone', label: '麦克风' },
    { value: 'speaker', label: '音响' },
    { value: 'air_conditioner', label: '空调' },
    { value: 'other', label: '其他' },
  ];

  const roomStatuses = [
    { value: 'AVAILABLE', label: '可用' },
    { value: 'OCCUPIED', label: '占用' },
    { value: 'MAINTENANCE', label: '维护' },
    { value: 'DISABLED', label: '禁用' },
  ];

  return (
    <div className="p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? '编辑会议室' : '新增会议室'}
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'AVAILABLE',
            needApproval: false,
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="会议室名称"
                name="name"
                rules={[{ required: true, message: '请输入会议室名称' }]}
              >
                <Input placeholder="请输入会议室名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="会议室编号"
                name="code"
                rules={[{ required: true, message: '请输入会议室编号' }]}
              >
                <Input placeholder="请输入会议室编号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="容量"
                name="capacity"
                rules={[
                  { required: true, message: '请输入容量' },
                  { type: 'number', min: 1, max: 100, message: '容量必须在1-100之间' }
                ]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="人数" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="位置"
                name="location"
                rules={[{ required: true, message: '请输入位置' }]}
              >
                <Input placeholder="请输入位置" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="楼层"
                name="floor"
              >
                <Input placeholder="请输入楼层" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  {roomStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="最小预订时长（分钟）"
                name="minDuration"
              >
                <InputNumber min={15} max={1440} style={{ width: '100%' }} placeholder="分钟" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="最大预订时长（分钟）"
                name="maxDuration"
              >
                <InputNumber min={15} max={1440} style={{ width: '100%' }} placeholder="分钟" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="需要审批"
                name="needApproval"
                valuePropName="checked"
              >
                <Select>
                  <Option value={false}>否</Option>
                  <Option value={true}>是</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入会议室描述" />
          </Form.Item>

          <Card title="设备信息" className="mb-6">
            <Space direction="vertical" style={{ width: '100%' }}>
              {equipmentList.map((equipment, index) => (
                <Card key={index} size="small">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Input
                        placeholder="设备名称"
                        value={equipment.name}
                        onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                      />
                    </Col>
                    <Col span={6}>
                      <Select
                        placeholder="类型"
                        value={equipment.type}
                        onChange={(value) => updateEquipment(index, 'type', value)}
                        style={{ width: '100%' }}
                      >
                        {equipmentTypes.map(type => (
                          <Option key={type.value} value={type.value}>
                            {type.label}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={8}>
                      <Input
                        placeholder="描述"
                        value={equipment.description}
                        onChange={(e) => updateEquipment(index, 'description', e.target.value)}
                      />
                    </Col>
                    <Col span={2}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeEquipment(index)}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addEquipment}
                style={{ width: '100%' }}
              >
                添加设备
              </Button>
            </Space>
          </Card>

          <Card title="会议室图片" className="mb-6">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="flex flex-wrap gap-4 mb-4">
                {imageList.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      className="absolute -top-2 -right-2"
                      onClick={() => removeImage(index)}
                    />
                  </div>
                ))}
              </div>
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  上传图片
                </Button>
              </Upload>
            </Space>
          </Card>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '更新' : '创建'}
              </Button>
              <Button onClick={() => navigate('/rooms')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}