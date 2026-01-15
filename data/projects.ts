export interface Project {
    id: string;
    title: string;
    stack: string;
    slug: string;        // URL identifier (e.g., 'ilkom-web')
    category: string;    // Display category for list
    year: string;
    roles: string[];     // e.g., ['Art Direction', 'Development']
    jargon: string;      // e.g., '/// WEBGL EXPERIMENTS 2026 ///'
    description: string; // Long paragraph text
    thumbnail: string;   // Path to main image (e.g., '/images/thumb1.webp')
    video: string;       // Path to video
    gallery: string[];   // Array of secondary image paths
}

export const PROJECTS: Project[] = [
    {
        id: '01',
        title: 'Ilkom-Web',
        stack: 'REACT • THREE.JS',
        slug: 'ilkom-web',
        category: 'Dev / Design',
        year: '2025',
        roles: ['FRONTEND', 'UI/UX'],
        jargon: '/// ACADEMIC PORTAL REIMAGINED ///',
        description: 'A comprehensive redesign of the Computer Science faculty website. The goal was to modernize the information architecture while introducing a distinct visual identity that reflects the forward-thinking nature of the department. Built with Next.js and Framer Motion for seamless page transitions.',
        thumbnail: '/img/ilkomWeb.avif',
        video: '', // Placeholder
        gallery: ['/img/ilkomWeb.avif', '/img/HeroGate.avif'] // Using existing images
    },
    {
        id: '02',
        title: 'MyMeet',
        stack: 'KOTLIN • FIREBASE • AGORA',
        slug: 'mymeet',
        category: 'Mobile App',
        year: '2025',
        roles: ['BACKEND', 'UI/UX'],
        jargon: '/// VIRTUAL CONNECTION ///',
        description: 'MyMeet is a high-performance video conferencing application designed for low-bandwidth environments. It utilizes adaptive bitrate streaming and a custom signaling server to ensure stable connections. The UI focuses on clarity and accessibility.',
        thumbnail: '/img/HeroGate.avif', // Placeholder
        video: '',
        gallery: ['/img/HeroGate.avif', '/img/ilkomWeb.avif']
    },
    {
        id: '03',
        title: 'Schedule Integrated Manager',
        stack: 'MYSQL • LARAVEL • TAILWIND',
        slug: 'sim',
        category: 'Web Dev',
        year: '2025',
        roles: ['DATABASE', 'BACKEND'],
        jargon: '/// SYSTEMATIC EFFICIENCY ///',
        description: 'SIM (Schedule Integrated Manager) fixes the chaos of university course planning. It features an automated conflict detection algorithm and a drag-and-drop interface for ease of use. The backend is powered by Python/Django.',
        thumbnail: '/img/ilkomWeb.avif', // Placeholder
        video: '',
        gallery: ['/img/ilkomWeb.avif', '/img/HeroGate.avif']
    },
    {
        id: '04',
        title: 'MyTask',
        stack: 'REACT • PYTHON',
        slug: 'mytask',
        category: 'Web Daily',
        year: '2025',
        roles: ['FRONTEND', 'BACKEND'],
        jargon: '/// PRODUCTIVITY FLOW ///',
        description: 'A minimalist task management dashboard that emphasizes "flow state". It uses a dark-mode-first design language and supports keyboard shortcuts for rapid task entry. Local-first architecture ensures instant interactions.',
        thumbnail: '/img/HeroGate.avif', // Placeholder
        video: '',
        gallery: ['/img/HeroGate.avif', '/img/il*komWeb.avif']
    }
];
