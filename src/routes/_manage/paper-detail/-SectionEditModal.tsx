// SectionEditModal.tsx (已修正)
import { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  message,
  theme,
  Typography,
  Space,
  Alert,
} from 'antd';
import VanillaJsonEditor from '@/components/VanillaJsonEditor';
import { usePaperStore } from '@/stores';
import Ajv2020 from 'ajv/dist/2020';
import draft7Meta from 'ajv/dist/refs/json-schema-draft-07.json';
import examSchema from '@/data/schema/exam.schema.json';
import answerSchema from '@/data/schema/answer.schema.json';
import copySchema from '@/data/schema/copy.schema.json';

const ajv = new Ajv2020();
ajv.addMetaSchema(draft7Meta);
const validateExam = ajv.compile(examSchema as object);
const validateAnswer = ajv.compile(answerSchema as object);
const validateCopy = ajv.compile(copySchema as object);

export type SectionKey = 'preclass' | 'copyJson' | 'examJson' | 'answerJson';

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

  useEffect(() => {
    if (open) {
      const paper = papers.find((p) => p.id === paperId);
      if (!paper || !sectionKey) return;

      if (sectionKey === 'preclass') {
        form.setFieldsValue({ preclass: paper.preclass ?? '' });
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
        updatePaper(paperId, { preclass: values.preclass as string });
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

  const titleMap: Record<SectionKey, string> = {
    preclass: '课程导读',
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
            {sectionKey === 'preclass' ? '(Markdown格式)' : '(JSON格式)'}
          </Typography.Text>
        </Space>
      }
      width={sectionKey === 'preclass' ? 800 : 1000}
      style={{ top: 20 }}
      styles={{ body: { padding: '24px 24px 8px' } }}
      onOk={handleSave}
      onCancel={onClose}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}
      >
        {sectionKey === 'preclass' ? (
          <>
            <Alert
              message="支持 Markdown 格式编写，包括标题、列表、加粗、链接等基础语法。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              name="preclass"
              rules={[{ required: true, message: '请输入课程导读内容' }]}
            >
              <Input.TextArea
                rows={20}
                placeholder="请输入课程导读内容..."
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
