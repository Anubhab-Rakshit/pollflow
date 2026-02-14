'use client';

import { Hero } from "@/components/hero";
import { PollForm } from "@/components/poll-form";
import { TemplateGallery } from "@/components/template-gallery";
import { Template } from "@/lib/templates";
import { useState } from "react";

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    // Smooth scroll to form
    const formElement = document.getElementById('poll-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <PollForm initialTemplate={selectedTemplate} />
      <TemplateGallery onSelect={handleSelectTemplate} />
    </div>
  );
}
