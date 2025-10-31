import { db } from '@/db';
import { reports } from '@/db/schema';

async function main() {
    const sampleReports = [
        {
            sessionId: 1,
            generatedAt: new Date('2024-01-15T11:45:00').toISOString(),
            summary: {
                studentName: 'Alice Johnson',
                examTitle: 'Introduction to Computer Science - Midterm',
                sessionDuration: '1h 45m',
                overallStatus: 'passed',
                cheatingProbability: 15,
                violationsCount: 2,
                violationsSummary: [
                    { type: 'tab_switch', count: 2 }
                ],
                plagiarismScore: 8,
                recommendations: 'Student performed well with minimal suspicious activity. Minor tab switches detected but within acceptable range.',
                flaggedIncidents: ['2 tab switches detected during exam']
            },
            pdfUrl: 'https://storage.examguardian.com/reports/session-1-report.pdf'
        },
        {
            sessionId: 2,
            generatedAt: new Date('2024-01-16T15:20:00').toISOString(),
            summary: {
                studentName: 'Bob Martinez',
                examTitle: 'Data Structures and Algorithms - Final',
                sessionDuration: '2h 15m',
                overallStatus: 'flagged',
                cheatingProbability: 65,
                violationsCount: 8,
                violationsSummary: [
                    { type: 'tab_switch', count: 5 },
                    { type: 'multiple_faces', count: 2 },
                    { type: 'suspicious_object', count: 1 }
                ],
                plagiarismScore: 42,
                recommendations: 'Multiple violations detected including tab switches and face detection issues. Manual review recommended before grade finalization.',
                flaggedIncidents: [
                    '5 tab switches detected',
                    'Multiple faces detected at 10:30 AM',
                    'Phone detected at 10:45 AM',
                    'High plagiarism score on written answers'
                ]
            },
            pdfUrl: 'https://storage.examguardian.com/reports/session-2-report.pdf'
        },
        {
            sessionId: 3,
            generatedAt: new Date('2024-01-17T16:35:00').toISOString(),
            summary: {
                studentName: 'Charlie Davis',
                examTitle: 'Web Development Fundamentals - Quiz',
                sessionDuration: '45m',
                overallStatus: 'passed',
                cheatingProbability: 5,
                violationsCount: 0,
                violationsSummary: [],
                plagiarismScore: 3,
                recommendations: 'Excellent exam session with no violations detected. Student maintained focus throughout the exam.',
                flaggedIncidents: []
            },
            pdfUrl: null
        },
        {
            sessionId: 5,
            generatedAt: new Date('2024-01-19T10:50:00').toISOString(),
            summary: {
                studentName: 'Eva Rodriguez',
                examTitle: 'Database Systems - Midterm',
                sessionDuration: '1h 30m',
                overallStatus: 'flagged',
                cheatingProbability: 78,
                violationsCount: 12,
                violationsSummary: [
                    { type: 'tab_switch', count: 8 },
                    { type: 'no_face_detected', count: 3 },
                    { type: 'multiple_faces', count: 1 }
                ],
                plagiarismScore: 67,
                recommendations: 'Serious violations detected throughout the exam. High cheating probability requires immediate manual review and possible exam invalidation.',
                flaggedIncidents: [
                    '8 tab switches detected',
                    'Face not detected for 3 extended periods',
                    'Multiple people detected at 9:25 AM',
                    'Very high plagiarism score on essay questions',
                    'Suspicious activity pattern throughout exam'
                ]
            },
            pdfUrl: 'https://storage.examguardian.com/reports/session-5-report.pdf'
        },
        {
            sessionId: 6,
            generatedAt: new Date('2024-01-20T14:15:00').toISOString(),
            summary: {
                studentName: 'Frank Wilson',
                examTitle: 'Operating Systems - Final',
                sessionDuration: '2h 0m',
                overallStatus: 'passed',
                cheatingProbability: 22,
                violationsCount: 3,
                violationsSummary: [
                    { type: 'tab_switch', count: 3 }
                ],
                plagiarismScore: 18,
                recommendations: 'Student completed exam with acceptable integrity. Minor tab switches noted but overall behavior was consistent with normal exam taking.',
                flaggedIncidents: ['3 tab switches detected during exam']
            },
            pdfUrl: null
        }
    ];

    await db.insert(reports).values(sampleReports);
    
    console.log('✅ Reports seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});