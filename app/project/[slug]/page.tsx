import { PROJECTS } from '@/data/projects';
import { notFound } from 'next/navigation';
import ProjectDetailView from '@/components/ProjectDetailView';


export function generateStaticParams() {
    return PROJECTS.map((project) => ({
        slug: project.slug,
    }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const projectIndex = PROJECTS.findIndex((p) => p.slug === slug);
    const project = PROJECTS[projectIndex];

    if (!project) {
        notFound();
    }

    const nextProject = PROJECTS[(projectIndex + 1) % PROJECTS.length];

    return <ProjectDetailView key={project.slug} project={project} nextProject={nextProject} />;
}
