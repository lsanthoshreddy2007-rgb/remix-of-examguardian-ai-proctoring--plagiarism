import { db } from '@/db';
import { classes } from '@/db/schema';

async function main() {
    const sampleClasses = [
        {
            name: 'Computer Science 101',
            code: 'CS101A',
            description: 'Introduction to programming fundamentals, data structures, and algorithms. Students will learn basic programming concepts using modern languages.',
            adminId: 1,
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        {
            name: 'Advanced Mathematics',
            code: 'MATH2B',
            description: 'Calculus, linear algebra, and differential equations for advanced students. Covers theoretical and applied mathematical concepts.',
            adminId: 1,
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-08').toISOString(),
        },
        {
            name: 'English Literature',
            code: 'ENG3C4',
            description: 'Classic and modern literature analysis, focusing on critical reading and writing. Explores major works from various literary periods.',
            adminId: 2,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            name: 'World History',
            code: 'HST4D5',
            description: 'Comprehensive study of world civilizations from ancient times to present. Examines cultural, political, and economic developments across continents.',
            adminId: 2,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Physics Laboratory',
            code: 'PHY5E6',
            description: 'Hands-on physics experiments covering mechanics, thermodynamics, and electromagnetism. Emphasis on scientific method and data analysis.',
            adminId: 1,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        }
    ];

    await db.insert(classes).values(sampleClasses);
    
    console.log('✅ Classes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});