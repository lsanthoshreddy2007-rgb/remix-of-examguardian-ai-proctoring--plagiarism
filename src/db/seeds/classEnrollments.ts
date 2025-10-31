import { db } from '@/db';
import { classEnrollments } from '@/db/schema';

async function main() {
    const sampleEnrollments = [
        // Computer Science 101 (classId: 1) - 5 students
        {
            classId: 1,
            studentId: 3,
            enrolledAt: new Date('2024-01-05T09:00:00Z').toISOString(),
        },
        {
            classId: 1,
            studentId: 4,
            enrolledAt: new Date('2024-01-05T10:30:00Z').toISOString(),
        },
        {
            classId: 1,
            studentId: 5,
            enrolledAt: new Date('2024-01-06T08:45:00Z').toISOString(),
        },
        {
            classId: 1,
            studentId: 6,
            enrolledAt: new Date('2024-01-06T14:20:00Z').toISOString(),
        },
        {
            classId: 1,
            studentId: 7,
            enrolledAt: new Date('2024-01-07T11:15:00Z').toISOString(),
        },

        // Advanced Mathematics (classId: 2) - 4 students
        {
            classId: 2,
            studentId: 3,
            enrolledAt: new Date('2024-01-08T09:30:00Z').toISOString(),
        },
        {
            classId: 2,
            studentId: 4,
            enrolledAt: new Date('2024-01-08T13:45:00Z').toISOString(),
        },
        {
            classId: 2,
            studentId: 5,
            enrolledAt: new Date('2024-01-09T10:00:00Z').toISOString(),
        },
        {
            classId: 2,
            studentId: 6,
            enrolledAt: new Date('2024-01-09T15:30:00Z').toISOString(),
        },

        // English Literature (classId: 3) - 4 students
        {
            classId: 3,
            studentId: 4,
            enrolledAt: new Date('2024-01-10T08:15:00Z').toISOString(),
        },
        {
            classId: 3,
            studentId: 5,
            enrolledAt: new Date('2024-01-10T11:45:00Z').toISOString(),
        },
        {
            classId: 3,
            studentId: 6,
            enrolledAt: new Date('2024-01-11T09:20:00Z').toISOString(),
        },
        {
            classId: 3,
            studentId: 7,
            enrolledAt: new Date('2024-01-11T14:00:00Z').toISOString(),
        },

        // World History (classId: 4) - 3 students
        {
            classId: 4,
            studentId: 3,
            enrolledAt: new Date('2024-01-12T10:30:00Z').toISOString(),
        },
        {
            classId: 4,
            studentId: 5,
            enrolledAt: new Date('2024-01-12T13:15:00Z').toISOString(),
        },
        {
            classId: 4,
            studentId: 7,
            enrolledAt: new Date('2024-01-13T08:45:00Z').toISOString(),
        },

        // Physics Laboratory (classId: 5) - 4 students
        {
            classId: 5,
            studentId: 3,
            enrolledAt: new Date('2024-01-14T09:00:00Z').toISOString(),
        },
        {
            classId: 5,
            studentId: 4,
            enrolledAt: new Date('2024-01-14T11:30:00Z').toISOString(),
        },
        {
            classId: 5,
            studentId: 6,
            enrolledAt: new Date('2024-01-15T10:15:00Z').toISOString(),
        },
        {
            classId: 5,
            studentId: 7,
            enrolledAt: new Date('2024-01-15T14:45:00Z').toISOString(),
        },
    ];

    await db.insert(classEnrollments).values(sampleEnrollments);
    
    console.log('✅ Class enrollments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});