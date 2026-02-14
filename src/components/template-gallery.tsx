import { motion } from "framer-motion";
import { POPULAR_TEMPLATES, Template } from "@/lib/templates";
import { Plus } from "lucide-react";

interface TemplateGalleryProps {
    onSelect: (template: Template) => void;
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-4 px-4 sm:px-0">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Start with a template
                </h3>
                <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 px-2 sm:px-0">
                {POPULAR_TEMPLATES.map((template, index) => {
                    const Icon = template.icon;
                    return (
                        <motion.button
                            key={template.id}
                            onClick={() => onSelect(template)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative flex flex-col items-center justify-center p-4 h-32 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all text-center overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            <div className={`p-3 rounded-full mb-3 bg-gradient-to-br ${template.color} text-white shadow-sm group-hover:shadow-md transition-all`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {template.name}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
