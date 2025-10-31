import { db } from '@/db';
import { exams } from '@/db/schema';

async function main() {
    const sampleExams = [
        {
            title: 'Computer Science Midterm Exam',
            description: 'Comprehensive midterm examination covering fundamental programming concepts, data structures, and algorithm analysis. Students will be tested on their understanding of code implementation and problem-solving skills.',
            durationMinutes: 90,
            classCode: 'EXAM001',
            questions: [
                {
                    id: 1,
                    type: 'multiple-choice',
                    question: 'What is the time complexity of binary search in a sorted array?',
                    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
                    correctAnswer: 'O(log n)',
                    points: 10
                },
                {
                    id: 2,
                    type: 'multiple-choice',
                    question: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
                    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
                    correctAnswer: 'Stack',
                    points: 10
                },
                {
                    id: 3,
                    type: 'multiple-choice',
                    question: 'Which sorting algorithm has the best average-case time complexity?',
                    options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
                    correctAnswer: 'Merge Sort',
                    points: 15
                },
                {
                    id: 4,
                    type: 'short-answer',
                    question: 'Explain the concept of recursion and provide one example use case.',
                    points: 20
                },
                {
                    id: 5,
                    type: 'multiple-choice',
                    question: 'What is the primary advantage of using a hash table?',
                    options: ['Sorted data storage', 'O(1) average lookup time', 'Memory efficiency', 'Thread safety'],
                    correctAnswer: 'O(1) average lookup time',
                    points: 15
                }
            ],
            createdBy: 1,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            title: 'Advanced Mathematics Final',
            description: 'Final examination for advanced mathematics course covering calculus, linear algebra, and differential equations. This comprehensive exam evaluates students mastery of complex mathematical concepts and their application to real-world problems.',
            durationMinutes: 120,
            classCode: 'EXAM002',
            questions: [
                {
                    id: 1,
                    type: 'short-answer',
                    question: 'Calculate the definite integral of f(x) = 3x² + 2x from x = 0 to x = 4.',
                    points: 25
                },
                {
                    id: 2,
                    type: 'multiple-choice',
                    question: 'What is the rank of a 3x3 identity matrix?',
                    options: ['0', '1', '2', '3'],
                    correctAnswer: '3',
                    points: 15
                },
                {
                    id: 3,
                    type: 'short-answer',
                    question: 'State and prove the Fundamental Theorem of Calculus.',
                    points: 35
                },
                {
                    id: 4,
                    type: 'multiple-choice',
                    question: 'Which method is most efficient for solving systems of linear equations?',
                    options: ['Substitution', 'Gaussian Elimination', 'Graphing', 'Trial and Error'],
                    correctAnswer: 'Gaussian Elimination',
                    points: 25
                }
            ],
            createdBy: 1,
            createdAt: new Date('2024-02-01').toISOString(),
        },
        {
            title: 'English Literature Quiz',
            description: 'Quick assessment quiz covering classic English literature from the 19th and 20th centuries. Focus on major works, authors, and literary movements including Romanticism, Victorian literature, and Modernism.',
            durationMinutes: 45,
            classCode: 'EXAM003',
            questions: [
                {
                    id: 1,
                    type: 'multiple-choice',
                    question: 'Who wrote the novel "Pride and Prejudice"?',
                    options: ['Charlotte Brontë', 'Jane Austen', 'George Eliot', 'Virginia Woolf'],
                    correctAnswer: 'Jane Austen',
                    points: 10
                },
                {
                    id: 2,
                    type: 'short-answer',
                    question: 'Explain the symbolism of the green light in "The Great Gatsby" by F. Scott Fitzgerald.',
                    points: 15
                },
                {
                    id: 3,
                    type: 'multiple-choice',
                    question: 'Which literary movement emphasized emotion, nature, and individualism?',
                    options: ['Realism', 'Romanticism', 'Naturalism', 'Modernism'],
                    correctAnswer: 'Romanticism',
                    points: 10
                }
            ],
            createdBy: 1,
            createdAt: new Date('2024-02-10').toISOString(),
        }
    ];

    await db.insert(exams).values(sampleExams);
    
    console.log('✅ Exams seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});