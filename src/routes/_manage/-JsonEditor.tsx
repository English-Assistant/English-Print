import { useState } from 'react';
import { Input, Typography } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

interface Props {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}

/**
 * 轻量级 JSON 编辑器组件：
 *  - 使用 Antd TextArea 渲染
 *  - 输入变化即尝试解析 JSON，解析失败高亮红边
 */
export default function JsonEditor({ value, onChange, placeholder }: Props) {
  const [invalid, setInvalid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    onChange?.(v);
    if (!v) {
      setInvalid(false);
      return;
    }
    try {
      JSON.parse(v);
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  };

  return (
    <div>
      <TextArea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoSize={{ minRows: 3, maxRows: 8 }}
        className={invalid ? 'border-red-500' : ''}
      />
      {invalid && <Text type="danger">JSON 格式不正确</Text>}
    </div>
  );
}
