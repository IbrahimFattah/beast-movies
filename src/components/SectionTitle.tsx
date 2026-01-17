interface SectionTitleProps {
    title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-accent rounded-full" />
            <h2 className="text-xl md:text-2xl font-semibold text-white">{title}</h2>
        </div>
    );
}
