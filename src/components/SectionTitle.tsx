interface SectionTitleProps {
    title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
    return (
        <div className="flex items-center gap-4 mb-6 animate-fadeIn">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {title}
            </h2>
            <div className="h-0.5 flex-1 max-w-[100px] bg-gradient-to-r from-accent to-transparent" />
        </div>
    );
}
