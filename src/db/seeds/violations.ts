import { db } from '@/db';
import { violations } from '@/db/schema';

async function main() {
    const sampleViolations = [
        // Session 1 (completed) - 1 low severity violation
        {
            sessionId: 1,
            violationType: 'tab_switch',
            severity: 'low',
            timestamp: new Date('2024-01-15T10:23:00Z').toISOString(),
            snapshotUrl: null,
            description: 'Student briefly switched to another browser tab during exam',
        },
        
        // Session 2 (completed) - 2 low/medium violations
        {
            sessionId: 2,
            violationType: 'tab_switch',
            severity: 'low',
            timestamp: new Date('2024-01-16T09:45:00Z').toISOString(),
            snapshotUrl: null,
            description: 'Brief tab switch detected, returned within 3 seconds',
        },
        {
            sessionId: 2,
            violationType: 'no_face',
            severity: 'medium',
            timestamp: new Date('2024-01-16T09:58:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-2-violation-1.jpg',
            description: 'Face temporarily out of frame for 8 seconds',
        },
        
        // Session 3 (completed) - 1 low violation
        {
            sessionId: 3,
            violationType: 'tab_switch',
            severity: 'medium',
            timestamp: new Date('2024-01-17T14:12:00Z').toISOString(),
            snapshotUrl: null,
            description: 'Tab switch detected for 5 seconds before returning',
        },
        
        // Session 4 (flagged) - 4 violations with higher severity
        {
            sessionId: 4,
            violationType: 'multiple_faces',
            severity: 'high',
            timestamp: new Date('2024-01-18T11:05:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-4-violation-1.jpg',
            description: 'Multiple faces detected in camera frame - possible unauthorized assistance',
        },
        {
            sessionId: 4,
            violationType: 'phone_detected',
            severity: 'high',
            timestamp: new Date('2024-01-18T11:18:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-4-violation-2.jpg',
            description: 'Mobile phone detected in hand during exam session',
        },
        {
            sessionId: 4,
            violationType: 'tab_switch',
            severity: 'medium',
            timestamp: new Date('2024-01-18T11:32:00Z').toISOString(),
            snapshotUrl: null,
            description: 'Extended tab switch - away from exam for 12 seconds',
        },
        {
            sessionId: 4,
            violationType: 'no_face',
            severity: 'medium',
            timestamp: new Date('2024-01-18T11:48:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-4-violation-3.jpg',
            description: 'Student face not detected for extended period of 15 seconds',
        },
        
        // Session 5 (flagged) - 3 violations with higher severity
        {
            sessionId: 5,
            violationType: 'phone_detected',
            severity: 'medium',
            timestamp: new Date('2024-01-19T13:22:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-5-violation-1.jpg',
            description: 'Phone visible on desk near student',
        },
        {
            sessionId: 5,
            violationType: 'multiple_faces',
            severity: 'high',
            timestamp: new Date('2024-01-19T13:35:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-5-violation-2.jpg',
            description: 'Two distinct faces detected - potential cheating incident',
        },
        {
            sessionId: 5,
            violationType: 'phone_detected',
            severity: 'high',
            timestamp: new Date('2024-01-19T13:47:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-5-violation-3.jpg',
            description: 'Student actively using mobile device during exam',
        },
        
        // Session 6 (flagged) - 4 violations with higher severity
        {
            sessionId: 6,
            violationType: 'multiple_faces',
            severity: 'high',
            timestamp: new Date('2024-01-20T15:08:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-6-violation-1.jpg',
            description: 'Multiple people detected in examination area',
        },
        {
            sessionId: 6,
            violationType: 'phone_detected',
            severity: 'medium',
            timestamp: new Date('2024-01-20T15:25:00Z').toISOString(),
            snapshotUrl: null,
            description: 'Mobile device detected within reach of student',
        },
        {
            sessionId: 6,
            violationType: 'tab_switch',
            severity: 'low',
            timestamp: new Date('2024-01-20T15:38:00Z').toISOString(),
            snapshotUrl: null,
            description: 'Quick tab switch detected and logged',
        },
        {
            sessionId: 6,
            violationType: 'no_face',
            severity: 'medium',
            timestamp: new Date('2024-01-20T15:52:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-6-violation-2.jpg',
            description: 'Student left camera view for 10 seconds',
        },
        
        // Session 7 (active) - 2 violations
        {
            sessionId: 7,
            violationType: 'multiple_faces',
            severity: 'high',
            timestamp: new Date('2024-01-22T09:15:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-7-violation-1.jpg',
            description: 'Additional person entered frame during active exam session',
        },
        {
            sessionId: 7,
            violationType: 'phone_detected',
            severity: 'high',
            timestamp: new Date('2024-01-22T09:28:00Z').toISOString(),
            snapshotUrl: 'https://storage.examguardian.com/snapshots/session-7-violation-2.jpg',
            description: 'Student handling phone while exam is in progress',
        },
        
        // Session 8 (active) - 1 violation
        {
            sessionId: 8,
            violationType: 'no_face',
            severity: 'medium',
            timestamp: new Date('2024-01-22T11:42:00Z').toISOString(),
            snapshotUrl: null,
            description: 'Face detection lost temporarily during exam',
        },
    ];

    await db.insert(violations).values(sampleViolations);
    
    console.log('✅ Violations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});