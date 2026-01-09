import SmartVideo from "@/components/SmartVideo";
import ProjectNavigation from "@/components/ProjectNavigation";

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    return (
        <main className="min-h-screen py-32 px-4 sm:px-8 max-w-5xl mx-auto">
            <ProjectNavigation />
            <header className="mb-24">
                <div className="text-sm opacity-50 mb-8 font-mono">PROJECT ID: {slug}</div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase mb-8">
                    {slug.replace('-', ' ')}
                </h1>
                <div className="flex justify-between items-start border-t border-white/20 pt-8 font-mono text-sm">
                    <div className="max-w-md">
                        <p>
                            A comprehensive exploration of web dynamics in digital interfaces.
                            Merging technical ability with smooth design.
                        </p>
                    </div>
                    <div>
                        2025 / WEBGL / NEXT.JS
                    </div>
                </div>
            </header>

            <section className="space-y-32">
                <SmartVideo />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="aspect-square bg-neutral-900 border border-neutral-800" />
                    <div className="aspect-square bg-neutral-900 border border-neutral-800" />
                </div>
            </section>
        </main>
    )
}