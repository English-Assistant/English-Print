import { createFileRoute } from '@tanstack/react-router';
import { useStore } from '@/store';

export const Route = createFileRoute('/preclass-guide/[id]')({
  component: PreclassGuide,
});

function PreclassGuide() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = useStore();
  const paper = papers.find((p) => p.id === id);

  if (!paper) {
    return <div className="p-6">未找到试卷数据</div>;
  }

  interface Course {
    title?: string;
    code?: string;
    teacher?: string;
    summary?: string;
    chapters?: Chapter[];
  }

  let course: Course | null = null;
  try {
    course = paper.preclassJson ? JSON.parse(paper.preclassJson) : null;
  } catch {
    course = null;
  }

  if (!course) {
    return <div className="p-6">暂无课程导读数据</div>;
  }

  return (
    <div className="w-[794px] mx-auto flex flex-col gap-4 pt-8 pb-36 print:w-[210mm] print:min-h-[297mm]">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-blue-900 text-center">
        {course.title || '课程导读'}
      </h1>

      {/* 课程基本信息 */}
      <div className="flex gap-8 px-12 text-gray-700">
        <InfoField label="课程编号:" value={course.code || ''} />
        <InfoField
          label="授课教师:"
          value={course.teacher || ''}
          className="ml-auto"
        />
      </div>

      {/* 分隔线 */}
      <hr className="border-gray-200 mx-auto w-[730px]" />

      {course.summary && (
        <section className="bg-gray-50 rounded-lg mx-8 p-4 space-y-2">
          <h2 className="text-lg font-medium text-blue-900">课程概述</h2>
          <p className="text-gray-700 leading-5">{course.summary}</p>
        </section>
      )}

      {/* 章节列表 */}
      {(course.chapters || []).map((chap: Chapter) => (
        <ChapterCard key={chap.title} chapter={chap} />
      ))}

      {/* 页脚 */}
      <footer className="mt-auto border-t border-gray-200 text-center text-gray-500 pt-4">
        第1页
      </footer>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string;
  className?: string;
}
function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="text-gray-500 whitespace-nowrap">{label}</span>
      <span className="min-w-[160px] border-b border-gray-400 inline-block text-black">
        {value}
      </span>
    </div>
  );
}

interface Chapter {
  title: string;
  description?: string;
  lessons?: { title: string; duration: string }[];
}
interface ChapterCardProps {
  chapter: Chapter;
}
function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <section className="border border-gray-200 rounded-lg shadow-sm mx-8 overflow-hidden">
      <div className="bg-[#F0F7FF] border-l-4 border-blue-600 px-6 py-3">
        <h3 className="text-base font-medium text-blue-900">{chapter.title}</h3>
      </div>
      {chapter.description && (
        <p className="mt-4 px-4 text-gray-700 leading-5">
          {chapter.description}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-4 pb-4">
        {(chapter.lessons || []).map((lesson) => (
          <LessonRow key={lesson.title} lesson={lesson} />
        ))}
      </div>
    </section>
  );
}

interface LessonRowProps {
  lesson: { title: string; duration: string };
}
function LessonRow({ lesson }: LessonRowProps) {
  return (
    <div className="flex items-start px-4 gap-3">
      <span className="mt-1 text-gray-600">•</span>
      <span className="font-medium text-gray-900 flex-1">{lesson.title}</span>
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {lesson.duration}
      </span>
    </div>
  );
}
