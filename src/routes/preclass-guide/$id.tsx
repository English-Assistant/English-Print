import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore } from '@/stores';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {
  NormalComponents,
  SpecialComponents,
} from 'react-markdown/lib/ast-to-react';
import type { HTMLAttributes, TableHTMLAttributes } from 'react';

export const Route = createFileRoute('/preclass-guide/$id')({
  component: PreclassGuide,
});

// 区块类型定义
interface PreclassBlock {
  type: string; // 如 theme, goal, grammar, vocab, mistake, culture, encourage
  title: string;
  content: string;
}

// 简单区块解析器：按二级标题（##）拆分
function parsePreclassBlocks(md: string): PreclassBlock[] {
  const lines = md.split(/\r?\n/);
  const blocks: PreclassBlock[] = [];
  let current: PreclassBlock | null = null;
  for (const line of lines) {
    const h2 = line.match(/^##\s*([\S\s]+)/);
    if (h2) {
      if (current) blocks.push(current);
      current = { type: '', title: h2[1].trim(), content: '' };
      continue;
    }
    if (current) {
      current.content += (current.content ? '\n' : '') + line;
    }
  }
  if (current) blocks.push(current);

  // 类型识别
  for (const b of blocks) {
    if (b.title.includes('主题')) b.type = 'theme';
    else if (b.title.includes('学习目标')) b.type = 'goal';
    else if (b.title.includes('语法')) b.type = 'grammar';
    else if (b.title.includes('词汇')) b.type = 'vocab';
    else if (b.title.includes('易错')) b.type = 'mistake';
    else if (b.title.includes('文化')) b.type = 'culture';
    else if (b.title.includes('信心') || b.title.includes('鼓励'))
      b.type = 'encourage';
    else b.type = 'other';
  }
  return blocks;
}

function PreclassGuide() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = usePaperStore();
  const paper = papers.find((p) => p.id === id);

  if (!paper) {
    return <div className="p-6">未找到试卷数据</div>;
  }
  if (!paper.preclass) {
    return <div className="p-6">暂无课程导读数据</div>;
  }

  // 动态解析区块
  const blocks = parsePreclassBlocks(paper.preclass);

  // 区块样式映射
  const blockMeta: Record<string, any> = {
    theme: {
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19793604e5dc65b-50853ae5-f39d-4010-bd64-5846d045d351.svg',
      borderColor: '#22C55E',
      bgColor: '#E6F2E6',
      textColor: '#166534',
    },
    goal: {
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19793604e5ded10-50fe899b-8ecb-4a5d-a898-e461b884ffdb.svg',
      borderColor: '#F59E0B',
      bgColor: '#FEF3C7',
      textColor: '#92400E',
    },
    grammar: {
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19793604e5fee23-c1a585f4-5a7e-4305-8fec-36923435ea3b.svg',
      borderColor: '#3B82F6',
      bgColor: '#E0F2FE',
      textColor: '#1E40AF',
    },
    vocab: {
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19793604e5f8a14-3d21a2ef-c7f4-4aef-a50f-9ddb649ec659.svg',
      borderColor: '#6366F1',
      bgColor: '#F0F7FF',
      textColor: '#4338CA',
    },
    mistake: {
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19793604e60cc63-c2df335f-a22c-4b00-8959-5a047af55284.svg',
      borderColor: '#EF4444',
      bgColor: '#FEE2E2',
      textColor: '#B91C1C',
    },
    culture: {
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19793604e61b061-1b6a1ab7-e727-4536-a179-7bf309dcecaa.svg',
      borderColor: '#14B8A6',
      bgColor: '#F0FDFA',
      textColor: '#0F766E',
    },
    encourage: {
      icon: 'https://miaoduo.fbcontent.cn/private/resource/image/19793604e63b977-1ffccf26-cbc4-44a7-a62a-23d742cd026d.svg',
      borderColor: '#EC4899',
      bgColor: '#FCE7F3',
      textColor: '#BE185D',
    },
    other: {
      icon: '',
      borderColor: '#E5E7EB',
      bgColor: '#fff',
      textColor: '#222',
    },
  };

  // 文化+鼓励并排特殊处理
  const cultureBlock = blocks.find((b) => b.type === 'culture');
  const encourageBlock = blocks.find((b) => b.type === 'encourage');
  const otherBlocks = blocks.filter(
    (b) => b.type !== 'culture' && b.type !== 'encourage',
  );

  return (
    <div className="bg-white w-[794px] mx-auto pt-8 pb-12 flex flex-col gap-8 font-sans print:w-[210mm] print:min-h-[297mm] relative">
      {/* 顶部标题+图标 */}
      <div className="flex flex-row items-center justify-center gap-2 mb-2">
        <div className="w-8 h-8 bg-[url('https://miaoduo.fbcontent.cn/private/resource/image/19793604e5b2e02-53db4428-d2f1-47ea-9aef-c27581d107cd.svg')] bg-cover ml-[227px]" />
        <h1 className="text-[24px] font-bold text-[#1E40AF] text-center w-[260px] leading-8">
          四季与天气表达课程导读
        </h1>
        <div className="w-8 h-8 bg-[url('https://miaoduo.fbcontent.cn/private/resource/image/19793604e5bc391-3405636e-075e-4322-b439-6e0ede7b59ab.svg')] bg-cover" />
      </div>
      {/* 学生信息行 */}
      <div className="flex flex-row justify-between items-center px-12 text-gray-700 font-medium">
        <div className="flex gap-2 items-baseline min-w-[260px]">
          <span>学生姓名:</span>
          <span className="border-b border-gray-400 inline-block min-w-[160px]" />
        </div>
        <div className="flex gap-2 items-baseline">
          <span>日期:</span>
          <span className="border-b border-gray-400 inline-block min-w-[128px]" />
        </div>
      </div>
      {/* 分隔线 */}
      <div className="w-[730px] h-px bg-gray-300 mx-auto my-2" />

      {/* 其它区块顺序渲染 */}
      {otherBlocks.map((block) => (
        <SectionCard
          key={block.title}
          icon={blockMeta[block.type].icon}
          title={block.title.replace(/^([\S]+\s)?/, '')}
          borderColor={blockMeta[block.type].borderColor}
          bgColor={blockMeta[block.type].bgColor}
          textColor={blockMeta[block.type].textColor}
        >
          <div className="pl-6 pt-2 pb-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {block.content.trim()}
            </ReactMarkdown>
          </div>
        </SectionCard>
      ))}

      {/* 文化与鼓励并排 */}
      {(cultureBlock || encourageBlock) && (
        <div className="flex flex-row gap-6 px-8 mt-2">
          {cultureBlock && (
            <SectionCard
              icon={blockMeta['culture'].icon}
              title={cultureBlock.title.replace(/^([\S]+\s)?/, '')}
              borderColor={blockMeta['culture'].borderColor}
              bgColor={blockMeta['culture'].bgColor}
              textColor={blockMeta['culture'].textColor}
              className="flex-1"
            >
              <div className="pl-6 pt-2 pb-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {cultureBlock.content.trim()}
                </ReactMarkdown>
              </div>
            </SectionCard>
          )}
          {encourageBlock && (
            <SectionCard
              icon={blockMeta['encourage'].icon}
              title={encourageBlock.title.replace(/^([\S]+\s)?/, '')}
              borderColor={blockMeta['encourage'].borderColor}
              bgColor={blockMeta['encourage'].bgColor}
              textColor={blockMeta['encourage'].textColor}
              className="flex-1"
            >
              <div className="pl-6 pt-2 pb-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {encourageBlock.content.trim()}
                </ReactMarkdown>
              </div>
            </SectionCard>
          )}
        </div>
      )}
      {/* 页脚 */}
      <div className="w-full flex justify-center items-center mt-8 text-gray-500 text-sm border-t border-gray-200 pt-4">
        四季与天气表达 · 课程导读 · 第 1 页
      </div>
    </div>
  );
}

// 自定义 markdown 渲染组件（后续可细化表格/提示/引用等）
const markdownComponents: Partial<NormalComponents & SpecialComponents> = {
  table: (props: TableHTMLAttributes<HTMLTableElement>) => (
    <table
      className="w-full bg-[#F9FAFB] rounded-md overflow-hidden text-left my-3"
      {...props}
    />
  ),
  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th className="font-medium px-4 py-2 border border-gray-300" {...props} />
  ),
  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-gray-300 px-4 py-2" {...props} />
  ),
  blockquote: (props: HTMLAttributes<HTMLElement>) => (
    <blockquote
      className="bg-[#FDF2F8] rounded-md px-6 py-4 text-center text-black mb-2"
      {...props}
    />
  ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 space-y-1" {...props} />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 space-y-1" {...props} />
  ),
  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <li className="text-black" {...props} />
  ),
  hr: () => <div className="my-6 w-full h-px bg-gray-200" />,
  strong: (props: HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-black" {...props} />
  ),
  em: (props: HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props} />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-black leading-6 whitespace-pre-wrap" {...props} />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-base font-semibold text-gray-900 mt-6 mb-2"
      {...props}
    />
  ),
};

// 区块通用卡片组件
function SectionCard({
  icon,
  title,
  borderColor,
  bgColor,
  textColor,
  children,
  className = '',
}: {
  icon: string;
  title: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
      style={{ background: '#fff', marginLeft: 32, marginRight: 32 }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ background: bgColor, borderLeft: `4px solid ${borderColor}` }}
      >
        <img src={icon} className="w-6 h-6" alt="icon" />
        <span
          className="text-[18px] font-semibold"
          style={{ color: textColor }}
        >
          {title}
        </span>
      </div>
      <div className="pb-2">{children}</div>
    </div>
  );
}
