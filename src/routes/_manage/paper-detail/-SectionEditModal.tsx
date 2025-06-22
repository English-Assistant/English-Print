// SectionEditModal.tsx (已修正)
import { useEffect } from 'react'; // 1. 导入 useEffect
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
  const [form] = Form.useForm();

  // 2. 添加 useEffect 来同步数据到表单
  useEffect(() => {
    // 仅在弹窗打开时执行
    if (open) {
      const paper = papers.find((p) => p.id === paperId);
      if (!paper || !sectionKey) return;

      if (sectionKey === 'preclass') {
        // 为 Markdown 区域设置值
        form.setFieldsValue({ preclass: paper.preclass ?? '' });
      } else {
        // 为 JSON 编辑器区域设置值
        const jsonValue = paper[sectionKey] ?? {};
        form.setFieldsValue({ json: jsonValue });
      }
    }
  }, [open, paperId, sectionKey, papers, form]); // 依赖项数组，确保在关键 props 变化时重新执行

  const handleSave = async () => {
    const values = await form.validateFields();

    if (sectionKey === 'preclass') {
      updatePaper(paperId, { preclass: values.preclass as string });
    } else {
      // 从 Form 获取的值已经是正确的对象格式，因为 VanillaJsonEditor 的 onChange 做了处理
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
      // 3. 移除 Form 上的 initialValues，因为它现在由 useEffect 控制
    >
      {sectionKey === 'preclass' ? (
        <Form form={form} layout="vertical">
          <Form.Item
            label="Markdown 内容"
            name="preclass"
            rules={[{ required: true, message: '不能为空' }]}
          >
            <Input.TextArea rows={12} />
          </Form.Item>
        </Form>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="json"
            // getValueFromEvent 替代 getValueProps, 这是 antd 中更标准的处理自定义组件值的方式
            getValueFromEvent={(v) => {
              // 这个函数会在 VanillaJsonEditor 的 onChange 被调用时触发
              return v;
            }}
            rules={[
              { required: true, message: 'JSON内容不能为空' },
              {
                validator: async (_rule, v: Record<string, unknown>) => {
                  // v 已经是 JS 对象，无需解析
                  if (!v) return Promise.reject(new Error('JSON内容不能为空'));

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
                      // 提取更详细的错误信息
                      errors = validator.errors
                        .map((e) => `${e.instancePath || 'root'} ${e.message}`)
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
          >
            <VanillaJsonEditor
              readOnly={false}
              className="h-[500px] overflow-hidden overflow-y-auto max-h-[500px]"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
