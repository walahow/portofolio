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
    video?: string | { src: string; isVertical?: boolean }; // Path to video or object
    gallery: (string | { src: string; isVertical?: boolean })[];   // Array of secondary image paths or objects
    arcana: string | { mobile: string; desktop: string };      // Tarot/Arcana persona name
    cardImage: string;   // Path to Tarot card image for transition
    overviewHeading?: string; // Custom heading for Project Overview
    theme?: 'light' | 'dark'; // NEW: Theme preference
}

export const PROJECTS: Project[] = [
    {
        id: '01',
        title: 'S.I.M',
        stack: 'LARAVEL • MYSQL',
        slug: 'sim',
        category: 'Web Dev',
        year: '2024',
        roles: ['DATABASE', 'BACKEND'],
        description: 'Eliminating temporal conflicts in academic spaces. A robust scheduling engine ensuring fair resource distribution.',
        thumbnail: '/img/SIM/thumbn.avif', // Placeholder
        video: '/img/SIM/vid.webm',
        gallery: ['/img/SIM/1.avif', '/img/SIM/2.avif'],
        arcana: {
            desktop: 'FOOL',
            mobile: '0. THE FOOL'
        },
        cardImage: '/img/arcana/FOOL.webp',
        overviewHeading: 'Orchestrating Academic Order.',
        theme: 'light'
    },
    {
        id: '02',
        title: 'Garage',
        stack: 'BLENDER • 3D PRINT',
        slug: 'garage',
        category: 'Hobbyist',
        year: '2025',
        roles: ['DESIGNER', 'PHOTOGRAPHER'],
        description: 'Realizing imagination into matter. A collection of physical prototypes designed in the digital void and realized through the layers of 3D printing.',
        thumbnail: '/img/extack/thumbn.avif', // Placeholder
        video: '',
        gallery: ['/img/extack/1.avif', '/img/extack/4.avif', '/img/extack/3.avif', '/img/extack/2.avif'],
        arcana: {
            desktop: 'MAGICIAN',
            mobile: 'I. THE MAGICIAN'
        },
        cardImage: '/img/arcana/magician.webp',
        overviewHeading: 'Brought to Reality.',
        theme: 'dark'
    },
    {
        id: '03',
        title: 'Diecast',
        stack: 'MINI GT • INNO 64',
        slug: 'diecast-photography',
        category: 'Photography',
        year: '2025',
        roles: ['PHOTOGRAPHER'],
        description: 'Capturing the soul of JDM legends in 1:64 scale. A visual study on lighting, texture, and the illusion of reality.',
        thumbnail: '/img/diecasr/5.avif', // Placeholder
        video: '/img/diecasr/vid.webm',
        gallery: ['/img/diecasr/2.avif', '/img/diecasr/3.avif', '/img/diecasr/4.avif', '/img/diecasr/5.avif', '/img/diecasr/7.avif'],
        arcana: {
            desktop: 'TEMPERANCE',
            mobile: 'XIV. TEMPERANCE'
        },
        cardImage: '/img/arcana/temperance.webp',
        overviewHeading: 'Small Scale. Massive Soul.',
        theme: 'dark'
    },
    {
        id: '04',
        title: 'MyMeet',
        stack: 'KOTLIN • FIREBASE',
        slug: 'mymeet',
        category: 'Mobile App',
        year: '2025',
        roles: ['BACKEND', 'UI/UX'],
        description: 'Redefining online meetings through synchronization. Built for low-bandwith conference tool prioritizing document clarity over pixelated video streams.',
        thumbnail: '/img/MyMeet/thumbn.avif', // Placeholder
        video: { src: '/img/MyMeet/vid.webm', isVertical: true },
        gallery: [{ src: '/img/MyMeet/1.avif', isVertical: true }, { src: '/img/MyMeet/2.avif', isVertical: true }],
        arcana: {
            desktop: 'LOVERS',
            mobile: 'VI. LOVERS'
        },
        cardImage: '/img/arcana/lovers.webp',
        overviewHeading: 'Discussion, Optimized.',
        theme: 'dark'
    },
    {
        id: '05',
        title: 'Ilkom-Web',
        stack: 'REACT • R3F',
        slug: 'ilkom-web',
        category: 'Dev / Design',
        year: '2025',
        roles: ['FRONTEND', 'UI/UX'],
        description: 'Shattering academic sterility with WebGL. An immersive digital campus designed to embody the core of Computer Science.',
        thumbnail: '/img/webIlkom/1.avif',
        video: '/img/webIlkom/vid.webm', // Placeholder
        gallery: ['/img/webIlkom/1.avif', '/img/webIlkom/2.avif'], // Using existing images
        arcana: {
            desktop: 'STAR',
            mobile: 'XVII. THE STAR'
        },
        cardImage: '/img/arcana/star.webp',
        overviewHeading: 'The Digital Facade.',
        theme: 'dark'
    },
    {
        id: '06',
        title: 'MyTask',
        stack: 'REACT • PYTHON',
        slug: 'mytask',
        category: 'Web Daily',
        year: '2025',
        roles: ['FRONTEND', 'BACKEND'],
        description: 'A productivity engine built on logic, not motivation. MyTask transforms your to-do list into a strategic asset.',
        thumbnail: '/img/MyTask/thumbn.avif', // Placeholder
        video: '/img/MyTask/vid.webm',
        gallery: ['/img/MyTask/1.avif', '/img/MyTask/2.avif'],
        arcana: {
            desktop: 'JUSTICE',
            mobile: 'XI. JUSTICE'
        },
        cardImage: '/img/arcana/justice.webp',
        overviewHeading: 'Optimized by Math.',
        theme: 'light'
    },
    {
        id: '07', // The Origin / The End
        title: 'Pantheon', // Atau "The Manifestation"
        stack: 'NEXT.JS • FRAMER MOTION',
        slug: 'pantheon',
        category: 'Web Experience',
        year: '2026',
        roles: ['DESIGN ENGINEER', 'FULLSTACK'],

        // Deskripsi Meta
        description: 'Why show screenshots  of a place you already inhabit? This project is not a static case study; it is the very environment you are breathing in right now.',

        overviewHeading: 'My Pantheon.',

        // Thumbnail yang beda (misal: gambar abstrak/glitch)
        thumbnail: '/img/portofolio/thumbn.avif',

        // Video: Rekaman Terminal boot up / Coding timelapse
        video: '',

        // Gallery berisi gambar Teks/Tipografi (Buat gambar hitam tulisan putih)
        gallery: [
            '/img/portofolio/1.avif', // Tulis: "YOU ARE ALREADY HERE"
            '/img/portofolio/2.avif',  // Tulis: "RENDERED LIVE"
            '/img/portofolio/3.avif'   // Tulis: "CODE IS POETRY"
        ],

        arcana: {
            desktop: 'WORLD',
            mobile: 'XXI. THE WORLD'
        },
        cardImage: '/img/arcana/world.webp',
        // arcanaText: 'The magnum opus. A complete ecosystem where every distinct project converges. It is the final destination, a holistic celebration of the entire journey.',

        theme: 'dark' // Pastikan dark biar teks putihnya masuk
    }
];
