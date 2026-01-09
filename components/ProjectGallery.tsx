'use client';

import ProjectCard from "./ProjectCard";

export default function ProjectGallery() {
    return (
        <div className="min-h-screen py-24 px-4 sm:px-8 max-w-7xl mx-auto">
            <header className="mb-24 flex justify-between items-end border-b border-foreground/10 pb-8">
                <div>
                    <h1 className="ttext-4xl md:text-6xl font-bold tracking-tighter mb-2">SELECTED<br /> WORKS</h1>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm opacity-50">INDEX / [01-04]</p>
                </div>
            </header>

            <div className="space-y-48">
                {[
                    { id: '01', title: 'Ilkom-web', category: 'Dev / Design', year: '2025', image: '/img/ilkom-web.png' },
                    { id: '02', title: 'MyMeet', category: 'Mobile App', year: '2025', image: '/img/mymeet.jpg' },
                    { id: '03', title: 'Schedule Integrated Manager', category: 'Web Dev', year: '2025', image: '/img/sim.jpg' },
                    { id: '04', title: 'MyTask', category: 'Web Daily', year: '2025', image: '/img/mytask.jpg' },
                ].map((project) => (
                    <ProjectCard key={project.id} {...project} />
                ))}
            </div>
        </div>
    );
}