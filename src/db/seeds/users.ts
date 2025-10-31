import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            name: 'Dr. Michael Chen',
            email: 'michael.chen@examguardian.edu',
            role: 'admin',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Prof. Sarah Williams',
            email: 'sarah.williams@examguardian.edu',
            role: 'admin',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@university.edu',
            role: 'student',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'James Anderson',
            email: 'james.anderson@university.edu',
            role: 'student',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Sophia Patel',
            email: 'sophia.patel@university.edu',
            role: 'student',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Daniel Kim',
            email: 'daniel.kim@university.edu',
            role: 'student',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Olivia Thompson',
            email: 'olivia.thompson@university.edu',
            role: 'student',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});