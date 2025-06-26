import type { Paper, Course } from '@/stores';
import PrintPageLayout from './PrintPageLayout';
import type { ListeningMaterial } from '@/data/types/listening';

interface ListeningPageProps {
  paper?: Paper;
  course?: Course;
  title?: string;
}

export function ListeningPage({ paper, course, title }: ListeningPageProps) {
  const listeningData = paper?.listeningJson as ListeningMaterial;

  return (
    <PrintPageLayout>
      <PrintPageLayout.CenteredHeader
        title={title ?? '听力素材'}
        courseTitle={course?.title}
      />
      <div className="p-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-blue-50 border-l-4 border-blue-600 px-6 py-3">
            <h2 className="text-lg font-semibold text-blue-800">
              英语听力对话
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {listeningData?.dialogues.map((dialogue) => (
              <div key={dialogue.id} className="p-6">
                <div className="flex items-start gap-3">
                  <span className="font-medium text-black">
                    {dialogue.number}.
                  </span>
                  <div className="flex-1 space-y-2">
                    {dialogue.lines.map((line, index) => (
                      <p key={index} className="text-sm">
                        <span className="font-medium text-blue-800 mr-2">
                          {line.character}:
                        </span>
                        <span className="text-black">{line.sentence}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PrintPageLayout>
  );
}
