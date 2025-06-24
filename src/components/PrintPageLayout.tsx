import React from 'react';

interface PrintPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface CenteredHeaderProps {
  title: string;
  courseTitle?: string | null;
  showStudentName?: boolean;
}

interface LeftAlignedHeaderProps {
  title: string;
  courseTitle?: string | null;
}

function PrintPageLayout({
  children,
  className = 'pt-8 pb-12',
}: PrintPageLayoutProps) {
  return (
    <div className="bg-[#F9FAFB] print:bg-white p-8 font-sans">
      <div
        className={`w-[794px] mx-auto bg-white shadow-lg print:shadow-none print:w-full flex flex-col gap-4 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

const CenteredHeader: React.FC<CenteredHeaderProps> = ({
  title,
  courseTitle,
  showStudentName = true,
}) => {
  return (
    <header className="px-8">
      <h1 className="text-2xl font-bold text-[#1E40AF] text-center mb-4">
        {title}
      </h1>
      <div
        className={`flex items-center gap-8 text-sm text-gray-600 font-medium my-4 justify-center`}
      >
        {showStudentName && (
          <div className="flex gap-2 items-baseline" style={{ minWidth: 260 }}>
            <span>Student Name:</span>
            <span className="border-b border-gray-400 inline-block flex-1" />
          </div>
        )}
        <div className="flex gap-2 items-baseline" style={{ minWidth: 200 }}>
          <span>Course:</span>
          <span className="border-b border-gray-400 inline-block flex-1 px-2">
            {courseTitle}
          </span>
        </div>
      </div>
    </header>
  );
};

const LeftAlignedHeader: React.FC<LeftAlignedHeaderProps> = ({
  title,
  courseTitle,
}) => {
  return (
    <header className="px-8">
      <h1 className="text-2xl font-bold text-[#1E40AF] text-center mb-4">
        {title}
      </h1>
      <div className="flex justify-start items-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-medium">所属课程:</span>
          <span className="border-b border-gray-400 px-4 py-1 min-w-40">
            {courseTitle}
          </span>
        </div>
      </div>
    </header>
  );
};

PrintPageLayout.CenteredHeader = CenteredHeader;
PrintPageLayout.LeftAlignedHeader = LeftAlignedHeader;

export default PrintPageLayout;
