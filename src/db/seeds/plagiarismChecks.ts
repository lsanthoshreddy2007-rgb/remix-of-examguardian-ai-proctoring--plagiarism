import { db } from '@/db';
import { plagiarismChecks } from '@/db/schema';

async function main() {
    const samplePlagiarismChecks = [
        {
            sessionId: 1,
            fileName: 'assignment_submission_1.pdf',
            fileUrl: 'https://storage.examguardian.com/submissions/session-1-file.pdf',
            plagiarismScore: 23,
            matchedSources: [
                { source: 'Wikipedia - Computer Science Fundamentals', similarity: 15 },
                { source: 'Khan Academy - Introduction to Programming', similarity: 8 }
            ],
            analysisMethod: 'tf-idf',
            checkedAt: new Date('2024-01-15T16:45:00Z').toISOString(),
        },
        {
            sessionId: 2,
            fileName: 'essay_final.docx',
            fileUrl: 'https://storage.examguardian.com/submissions/session-2-file.pdf',
            plagiarismScore: 48,
            matchedSources: [
                { source: 'Journal of Educational Psychology', similarity: 28 },
                { source: 'Academic Writing Guidelines - University Press', similarity: 20 }
            ],
            analysisMethod: 'cosine',
            checkedAt: new Date('2024-01-16T11:20:00Z').toISOString(),
        },
        {
            sessionId: 3,
            fileName: 'research_paper.pdf',
            fileUrl: 'https://storage.examguardian.com/submissions/session-3-file.pdf',
            plagiarismScore: 72,
            matchedSources: [
                { source: 'ResearchGate - Machine Learning Applications', similarity: 45 },
                { source: 'IEEE Xplore - Neural Networks Study', similarity: 27 }
            ],
            analysisMethod: 'gpt',
            checkedAt: new Date('2024-01-16T15:10:00Z').toISOString(),
        },
        {
            sessionId: 5,
            fileName: 'lab_report_final.docx',
            fileUrl: 'https://storage.examguardian.com/submissions/session-5-file.pdf',
            plagiarismScore: 18,
            matchedSources: [
                { source: 'Lab Manual - Chemistry Experiments', similarity: 12 },
                { source: 'Scientific Method Guidelines', similarity: 6 }
            ],
            analysisMethod: 'tf-idf',
            checkedAt: new Date('2024-01-17T10:35:00Z').toISOString(),
        },
        {
            sessionId: 6,
            fileName: 'thesis_chapter_3.pdf',
            fileUrl: 'https://storage.examguardian.com/submissions/session-6-file.pdf',
            plagiarismScore: 51,
            matchedSources: [
                { source: 'Digital Library - Data Analysis Methods', similarity: 32 },
                { source: 'Statistics Textbook - Chapter 5', similarity: 19 }
            ],
            analysisMethod: 'cosine',
            checkedAt: new Date('2024-01-17T14:50:00Z').toISOString(),
        }
    ];

    await db.insert(plagiarismChecks).values(samplePlagiarismChecks);
    
    console.log('✅ Plagiarism checks seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});