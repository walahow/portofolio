import { PROJECTS } from '@/data/projects';
import { notFound } from 'next/navigation';
import ProjectDetailView from '@/components/ProjectDetailView';
import ProjectNavigation from '@/components/ProjectNavigation';

export function generateStaticParams() {
    return PROJECTS.map((project) => ({
        slug: project.slug,
    }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = PROJECTS.find((p) => p.slug === slug);

    if (!project) {
        notFound();
    }

    return (
        <>
            <ProjectNavigation />
            <ProjectDetailView project={project} />
        </>
    );
}
