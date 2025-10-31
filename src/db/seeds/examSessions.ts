import { db } from '@/db';
import { examSessions } from '@/db/schema';

async function main() {
    const sampleExamSessions = [
        // 3 completed sessions
        {
            examId: 1,
            studentId: 3,
            startedAt: new Date('2024-01-15T09:00:00').toISOString(),
            endedAt: new Date('2024-01-15T10:30:00').toISOString(),
            status: 'completed',
            cheatingScore: 25,
            tabSwitches: 3,
        },
        {
            examId: 2,
            studentId: 4,
            startedAt: new Date('2024-01-16T10:00:00').toISOString(),
            endedAt: new Date('2024-01-16T11:45:00').toISOString(),
            status: 'completed',
            cheatingScore: 32,
            tabSwitches: 4,
        },
        {
            examId: 3,
            studentId: 5,
            startedAt: new Date('2024-01-17T14:00:00').toISOString(),
            endedAt: new Date('2024-01-17T15:30:00').toISOString(),
            status: 'completed',
            cheatingScore: 20,
            tabSwitches: 2,
        },
        // 3 flagged sessions
        {
            examId: 1,
            studentId: 6,
            startedAt: new Date('2024-01-18T09:00:00').toISOString(),
            endedAt: new Date('2024-01-18T10:30:00').toISOString(),
            status: 'flagged',
            cheatingScore: 75,
            tabSwitches: 12,
        },
        {
            examId: 2,
            studentId: 7,
            startedAt: new Date('2024-01-19T11:00:00').toISOString(),
            endedAt: new Date('2024-01-19T12:45:00').toISOString(),
            status: 'flagged',
            cheatingScore: 82,
            tabSwitches: 15,
        },
        {
            examId: 3,
            studentId: 3,
            startedAt: new Date('2024-01-20T13:00:00').toISOString(),
            endedAt: new Date('2024-01-20T14:30:00').toISOString(),
            status: 'flagged',
            cheatingScore: 68,
            tabSwitches: 11,
        },
        // 2 active sessions
        {
            examId: 1,
            studentId: 4,
            startedAt: new Date('2024-01-21T09:00:00').toISOString(),
            endedAt: null,
            status: 'active',
            cheatingScore: 35,
            tabSwitches: 6,
        },
        {
            examId: 2,
            studentId: 5,
            startedAt: new Date('2024-01-21T10:00:00').toISOString(),
            endedAt: null,
            status: 'active',
            cheatingScore: 42,
            tabSwitches: 7,
        },
    ];

    await db.insert(examSessions).values(sampleExamSessions);
    
    console.log('✅ Exam sessions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});