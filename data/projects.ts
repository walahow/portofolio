export interface Project {
    id: string;
    title: string;
    stack: string;
    slug: string;        // URL identifier (e.g., 'ilkom-web')
    category: string;    // Display category for list
    year: string;
    roles: string[];     // e.g., ['Art Direction', 'Development']
    description: string; // Long paragraph text
    thumbnail: string;   // Path to main image (e.g., '/images/thumb1.webp')
    video: string | { src: string; isVertical?: boolean }; // Path to video or object
    gallery: (string | { src: string; isVertical?: boolean })[];   // Array of secondary image paths or objects
    arcana: string;      // Tarot/Arcana persona name
    overviewHeading?: string; // Custom heading for Project Overview
    theme?: 'light' | 'dark'; // NEW: Theme preference
}

export const PROJECTS: Project[] = [
    {
        id: '01',
        title: 'S.I.M',
        stack: 'MYSQL • LARAVEL • TAILWIND',
        slug: 'sim',
        category: 'Web Dev',
        year: '2025',
        roles: ['DATABASE', 'BACKEND'],
        description: 'Eliminating temporal conflicts in academic spaces. A robust scheduling engine ensuring fair resource distribution using DLM logic.',
        thumbnail: '/img/SIM/1.avif', // Placeholder
        video: '/img/SIM/vid.mp4',
        gallery: ['/img/SIM/1.avif', '/img/SIM/2.avif'],
        arcana: 'JUSTICE',
        overviewHeading: 'Orchestrating Academic Order.',
        theme: 'light'
    },
    {
        id: '02',
        title: 'Diecast Photography',
        stack: 'MYSQL • LARAVEL • TAILWIND',
        slug: 'diecast-photography',
        category: 'Photography',
        year: '2025',
        roles: ['PHOTOGRAPHER'],
        description: 'Capturing the soul of JDM legends in 1:64 scale. A visual study on lighting, texture, and the illusion of reality.',
        thumbnail: '/img/diecasr/5.avif', // Placeholder
        video: '/img/diecasr/vid.webm',
        gallery: ['/img/diecasr/1.avif', '/img/diecasr/2.avif', '/img/diecasr/3.avif', '/img/diecasr/4.avif', '/img/diecasr/5.avif', '/img/diecasr/6.avif', '/img/diecasr/7.avif'],
        arcana: 'JUSTICE',
        overviewHeading: 'Small Scale. Massive Soul.',
        theme: 'dark'
    },
    {
        id: '03',
        title: 'MyMeet',
        stack: 'KOTLIN • FIREBASE • AGORA',
        slug: 'mymeet',
        category: 'Mobile App',
        year: '2025',
        roles: ['BACKEND', 'UI/UX'],
        description: 'Redefining online meetings through synchronization. Built for low-bandwith conference tool prioritizing document clarity over pixelated video streams.',
        thumbnail: '/img/MyMeet/1.avif', // Placeholder
        video: { src: '/img/MyMeet/vid.mp4', isVertical: true },
        gallery: [{ src: '/img/MyMeet/1.avif', isVertical: true }, { src: '/img/MyMeet/2.avif', isVertical: true }],
        arcana: 'LOVERS',
        overviewHeading: 'Discussion, Optimized.',
        theme: 'dark'
    },
    {
        id: '04',
        title: 'Ilkom-Web',
        stack: 'REACT • THREE.JS',
        slug: 'ilkom-web',
        category: 'Dev / Design',
        year: '2025',
        roles: ['FRONTEND', 'UI/UX'],
        description: 'Shattering academic sterility with WebGL. An immersive digital campus designed to embody the core of Computer Science.',
        thumbnail: '/img/WebIlkom/1.avif',
        video: '/img/webIlkom/vid.mp4', // Placeholder
        gallery: ['/img/webIlkom/1.avif', '/img/webIlkom/2.avif'], // Using existing images
        arcana: 'MAGICIAN',
        overviewHeading: 'The Digital Facade.',
        theme: 'dark'
    },
    {
        id: '05',
        title: 'MyTask',
        stack: 'REACT • PYTHON',
        slug: 'mytask',
        category: 'Web Daily',
        year: '2025',
        roles: ['FRONTEND', 'BACKEND'],
        description: 'A productivity engine built on logic, not motivation. MyTask transforms your to-do list into a strategic asset.',
        thumbnail: '/img/MyTask/1.avif', // Placeholder
        video: '/img/MyTask/vid.mp4',
        gallery: ['/img/MyTask/1.avif', '/img/MyTask/2.avif'],
        arcana: 'CHARIOT',
        overviewHeading: 'Optimized by Math.',
        theme: 'light'
    }
];
