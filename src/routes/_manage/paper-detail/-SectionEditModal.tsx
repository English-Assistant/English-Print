import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
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

type SectionKey = 'preclass' | 'copyJson' | 'examJson' | 'answerJson';

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
  const paper = papers.find((p) => p.id === paperId);

  const [markdown, setMarkdown] = useState('');

  const jsonValue = sectionKey ? (paper?.[sectionKey] ?? {}) : {};

  const [form] = Form.useForm();

  const handleSave = async () => {
    const values = await form.validateFields();

    if (sectionKey === 'preclass') {
      updatePaper(paperId, { preclass: values.preclass as string });
    } else {
      const payload = values.json as Record<string, unknown>;

      if (sectionKey === 'copyJson')
        updatePaper(paperId, { copyJson: payload });
      if (sectionKey === 'examJson')
        updatePaper(paperId, { examJson: payload });
      if (sectionKey === 'answerJson')
        updatePaper(paperId, { answerJson: payload });
    }
    message.success('保存成功');
    onClose();
    return;
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
      title={sectionKey ? titleMap[sectionKey] : ''}
      onCancel={onClose}
      onOk={handleSave}
      width={sectionKey === 'preclass' ? 600 : 700}
      destroyOnClose
    >
      {sectionKey === 'preclass' ? (
        <Form layout="vertical">
          <Form.Item
            label="Markdown 内容"
            required
            rules={[{ required: true, message: '不能为空' }]}
            name="preclass"
          >
            <Input.TextArea
              rows={12}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </Form.Item>
        </Form>
      ) : (
        <Form form={form} layout="vertical" initialValues={{ json: jsonValue }}>
          <Form.Item
            name="json"
            getValueProps={(v) => {
              return typeof v === 'string' ? JSON.parse(v) : v;
            }}
            rules={[
              {
                validator: async (_rule, v: Record<string, unknown>) => {
                  let valid = true;
                  if (sectionKey === 'copyJson') valid = validateCopy(v);
                  if (sectionKey === 'examJson') valid = validateExam(v);
                  if (sectionKey === 'answerJson') valid = validateAnswer(v);
                  return valid
                    ? Promise.resolve()
                    : Promise.reject(new Error('JSON Schema 校验失败'));
                },
              },
            ]}
          >
            <VanillaJsonEditor
              readOnly={false}
              className="h-[500px] overflow-hidden"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
