import { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import VanillaJsonEditor from '@/components/VanillaJsonEditor';
import { usePaperStore } from '@/stores';
import Ajv2020 from 'ajv/dist/2020';
// eslint-disable-next-line import/no-named-as-default-member
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
  const [jsonValue, setJsonValue] = useState<Record<string, unknown>>({});

  // 初始化数据
  useEffect(() => {
    if (!open || !sectionKey || !paper) return;
    if (sectionKey === 'preclass') {
      setMarkdown(paper.preclass || '');
    } else {
      try {
        const init = paper[sectionKey]
          ? JSON.parse(paper[sectionKey] as string)
          : {};
        setJsonValue(init);
      } catch {
        setJsonValue({});
      }
    }
  }, [open, sectionKey, paper]);

  const handleSave = () => {
    if (!sectionKey || !paper) return;

    if (sectionKey === 'preclass') {
      if (!markdown.trim()) {
        message.error('内容不能为空');
        return;
      }
      updatePaper(paperId, { preclass: markdown });
      message.success('保存成功');
      onClose();
      return;
    }

    // JSON 校验
    let valid = true;
    if (sectionKey === 'copyJson') valid = validateCopy(jsonValue);
    if (sectionKey === 'examJson') valid = validateExam(jsonValue);
    if (sectionKey === 'answerJson') valid = validateAnswer(jsonValue);

    if (!valid) {
      const errMsg = (validateCopy.errors ||
        validateExam.errors ||
        validateAnswer.errors ||
        [])?.[0]?.message;
      message.error(`Schema 校验失败: ${errMsg}`);
      return;
    }

    updatePaper(paperId, { [sectionKey]: JSON.stringify(jsonValue) });
    message.success('保存成功');
    onClose();
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
          >
            <Input.TextArea
              rows={12}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </Form.Item>
        </Form>
      ) : (
        <div className="h-[500px] overflow-hidden">
          <VanillaJsonEditor value={jsonValue} onChange={setJsonValue} />
        </div>
      )}
    </Modal>
  );
}
