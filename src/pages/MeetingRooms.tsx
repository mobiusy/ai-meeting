import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { meetingRoomApi } from '@/services/meetingRoomApi';
import { MeetingRoom, RoomStatus, Equipment } from '@/types/meetingRoom';
import { useMeetingRoomStore } from '@/stores/meetingRoom';

const { Search } = Input;
const { Option } = Select;

export default function MeetingRooms() {
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: '',
  });

  const navigate = useNavigate();
  const { rooms, setRooms, setLoading: setStoreLoading, removeRoom } = useMeetingRoomStore();

  useEffect(() => {
    fetchMeetingRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, searchParams]);

  const fetchMeetingRooms = async () => {
    try {
      setLoading(true);
      setStoreLoading(true);
      const response = await meetingRoomApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchParams.keyword,
        status: searchParams.status as RoomStatus,
      });
      
      if (response.success) {
        setRooms(response.data.list);
        setPagination({
          ...pagination,
          total: response.data.total,
        });
      }
    } catch (error: any) {
      message.error('获取会议室列表失败');
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  };

  const handleTableChange = (newPagination: Record<string, any>) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleSearch = (keyword: string) => {
    setSearchParams({ ...searchParams, keyword });
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusChange = (status: string) => {
    setSearchParams({ ...searchParams, status });
    setPagination({ ...pagination, current: 1 });
  };

  const handleDelete = async (id: string) => {
    try {
      await meetingRoomApi.delete(id);
      message.success('删除成功');
      removeRoom(id);
      fetchMeetingRooms();
    } catch (error: any) {
      message.error('删除失败');
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

  const columns: ColumnsType<MeetingRoom> = [
    {
      title: '会议室名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '会议室编号',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 80,
      render: (capacity: number) => `${capacity}人`,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '楼层',
      dataIndex: 'floor',
      key: 'floor',
      width: 100,
      render: (floor: string) => floor || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '设备',
      dataIndex: 'equipment',
      key: 'equipment',
      width: 200,
      render: (equipment: Equipment[]) => {
        if (!equipment || equipment.length === 0) return '-';
        return (
          <Space size="small" wrap>
            {equipment.slice(0, 3).map((item, index) => (
              <Tag key={index}>
                {item.name}
              </Tag>
            ))}
            {equipment.length > 3 && (
              <Tag>+{equipment.length - 3}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/rooms/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/rooms/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (window.confirm('确定要删除这个会议室吗？')) {
                handleDelete(record.id);
              }
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">会议室管理</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/rooms/new')}
            >
              新增会议室
            </Button>
          </div>

          <div className="flex gap-4 mb-4">
            <Search
              placeholder="搜索会议室名称或编号"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: 150 }}
              onChange={handleStatusChange}
            >
              <Option value="AVAILABLE">可用</Option>
              <Option value="OCCUPIED">占用</Option>
              <Option value="MAINTENANCE">维护</Option>
              <Option value="DISABLED">禁用</Option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={rooms}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}