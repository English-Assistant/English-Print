// SectionEditModal.tsx (已修正)
import { useEffect, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  App,
  theme,
  Typography,
  Space,
  Alert,
  Button,
} from 'antd';
import VanillaJsonEditor, {
  type JsonEditorHandle,
} from '@/components/VanillaJsonEditor';
import { usePaperStore } from '@/stores';
import {
  validateAnswer,
  validateCopy,
  validateExam,
  validateListening,
} from '@/utils/schemaValidators';

export type SectionKey =
  | 'preclass'
  | 'listeningJson'
  | 'copyJson'
  | 'examJson'
  | 'answerJson';

interface Props {
  open: boolean;
  paperId: string;
  sectionKey: SectionKey | null;
  onClose: () => void;
}

export default function SectionEditModal({
  open,
  paperId,
  sectionKey,
  onClose,
}: Props) {
  const { papers, updatePaper } = usePaperStore();
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const editorRef = useRef<JsonEditorHandle>(null);
  const { message } = App.useApp();
  useEffect(() => {
    if (open) {
      const paper = papers.find((p) => p.id === paperId);
      if (!paper || !sectionKey) return;

      if (sectionKey === 'preclass') {
        form.setFieldsValue({ [sectionKey]: paper[sectionKey] ?? '' });
      } else {
        const jsonValue = paper[sectionKey] ?? {};
        form.setFieldsValue({ json: jsonValue });
      }
    }
  }, [open, paperId, sectionKey, papers, form]);

  const handleSave = async () => {
    if (!sectionKey) {
      return;
    }
    try {
      const values = await form.validateFields();

      if (sectionKey === 'preclass') {
        updatePaper(paperId, { [sectionKey]: values[sectionKey] });
      } else {
        const payload = values.json as Record<string, unknown>;
        updatePaper(paperId, { [sectionKey]: payload });
      }
      message.success('保存成功');
      onClose();
    } catch {
      // Form validation will handle the error display
    }
  };

  const handleFormat = () => {
    editorRef.current?.format();
  };

  const titleMap: Record<SectionKey, string> = {
    preclass: '课程导读',
    listeningJson: '听力素材',
    copyJson: '抄写练习',
    examJson: '试卷',
    answerJson: '答案卡',
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Typography.Text strong>
            {sectionKey ? titleMap[sectionKey] : ''}
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {sectionKey === 'preclass' ? '(长文本格式)' : '(JSON格式)'}
          </Typography.Text>
        </Space>
      }
      width={sectionKey === 'preclass' ? 800 : 1000}
      style={{ top: 20 }}
      // styles={{ body: { padding: '24px 24px 8px' } }}
      onOk={handleSave}
      onCancel={onClose}
      okText="确定"
      cancelText="取消"
      footer={(_, { OkBtn, CancelBtn }) => {
        const isJsonMode = sectionKey !== 'preclass';
        return (
          <>
            <CancelBtn />
            {isJsonMode && <Button onClick={handleFormat}>格式化 JSON</Button>}
            <OkBtn />
          </>
        );
      }}
      forceRender={true}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}
      >
        {sectionKey === 'preclass' ? (
          <>
            <Alert
              message="支持纯文本或 Markdown 格式编写。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              name={sectionKey}
              rules={[{ required: true, message: '请输入内容' }]}
            >
              <Input.TextArea
                rows={20}
                placeholder="请输入内容..."
                style={{
                  fontFamily: token.fontFamilyCode,
                  backgroundColor: token.colorFillTertiary,
                }}
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Alert
              message="请按照规定的 JSON Schema 格式编写内容，编辑器会实时校验格式是否正确。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              name="json"
              rules={[
                { required: true, message: 'JSON内容不能为空' },
                {
                  validator: async (_rule, v: Record<string, unknown>) => {
                    if (!v)
                      return Promise.reject(new Error('JSON内容不能为空'));
                    let valid = true;
                    let errors: string | undefined;

                    const validator =
                      sectionKey === 'copyJson'
                        ? validateCopy
                        : sectionKey === 'examJson'
                          ? validateExam
                          : sectionKey === 'answerJson'
                            ? validateAnswer
                            : sectionKey === 'listeningJson'
                              ? validateListening
                              : null;

                    if (validator) {
                      valid = validator(v);
                      if (!valid && validator.errors) {
                        errors = validator.errors
                          .map(
                            (e) => `${e.instancePath || 'root'} ${e.message}`,
                          )
                          .join('; ');
                      }
                    }

                    return valid
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(`JSON Schema 校验失败: ${errors || ''}`),
                        );
                  },
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <VanillaJsonEditor
                ref={editorRef}
                readOnly={false}
                className="vanilla-json-editor"
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
