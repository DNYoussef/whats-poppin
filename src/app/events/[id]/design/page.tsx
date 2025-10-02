// ============================================================================
// What's Poppin! - Event Design Preview Page
// File: events/[id]/design/page.tsx
// Description: Preview and select AI-generated event page designs
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Sparkles, Check } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { EventPageDesign } from '@/lib/ai/page-designer';

const DynamicEventScene = dynamic(
  () => import('@/components/three/DynamicEventScene').then((mod) => mod.DynamicEventScene),
  { ssr: false }
);

interface DesignPreviewPageProps {
  params: {
    id: string;
  };
}

/**
 * Event design preview and selection page
 * @param params - Route parameters
 * @returns Design preview page component
 */
export default function DesignPreviewPage({ params }: DesignPreviewPageProps) {
  const router = useRouter();
  const [designs, setDesigns] = useState<EventPageDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [refining, setRefining] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    loadDesigns();
  }, [params.id]);

  const loadDesigns = async () => {
    try {
      const response = await fetch(`/api/ai/generate-design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: params.id })
      });

      if (!response.ok) throw new Error('Failed to generate designs');

      const data = await response.json();
      setDesigns(data.designs);
    } catch (error) {
      console.error('Design generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFeedback((prev) => prev + ' ' + transcript);
    };

    recognition.start();
  };

  const handleRefine = async () => {
    if (selectedDesign === null || !feedback.trim()) return;

    setRefining(true);
    try {
      const response = await fetch('/api/ai/refine-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design: designs[selectedDesign],
          feedback
        })
      });

      if (!response.ok) throw new Error('Failed to refine design');

      const data = await response.json();
      const updatedDesigns = [...designs];
      updatedDesigns[selectedDesign] = data.refinedDesign;
      setDesigns(updatedDesigns);
      setFeedback('');
    } catch (error) {
      console.error('Refinement error:', error);
    } finally {
      setRefining(false);
    }
  };

  const handleSave = async () => {
    if (selectedDesign === null) return;

    try {
      const response = await fetch(`/api/events/${params.id}/design`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design: designs[selectedDesign] })
      });

      if (!response.ok) throw new Error('Failed to save design');

      router.push(`/events/${params.id}`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-500" />
            <p className="text-lg">Generating designs with AI...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Choose Your Event Design</h1>
        <p className="text-muted-foreground">
          Select a design and provide feedback to refine it
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {designs.map((design, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all ${
              selectedDesign === index
                ? 'ring-2 ring-purple-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedDesign(index)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{design.theme}</CardTitle>
                {selectedDesign === index && (
                  <Check className="h-5 w-5 text-purple-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {design.theme === 'Minimal' && 'Elegant, subtle, professional design'}
                {design.theme === 'Bold' && 'Vibrant, energetic, eye-catching design'}
                {design.theme === 'Immersive' && 'Dramatic, cinematic, engaging design'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 bg-background rounded-lg overflow-hidden">
                <DynamicEventScene
                  design={design.spec}
                  eventTitle="Preview"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {design.spec.particles.count} particles
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {design.spec.camera.animation} camera
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {design.spec.centerpiece.type} centerpiece
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDesign !== null && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Refine Your Design</CardTitle>
            <p className="text-sm text-muted-foreground">
              Provide feedback to improve the selected design
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="E.g., 'Make the particles more vibrant' or 'Add more dramatic lighting'"
                  rows={4}
                  className="pr-12"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className={`absolute right-2 top-2 ${
                    isListening ? 'text-red-500 animate-pulse' : ''
                  }`}
                  onClick={handleVoiceInput}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleRefine}
                  disabled={!feedback.trim() || refining}
                  className="flex-1"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {refining ? 'Refining...' : 'Refine Design'}
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Save & Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDesign === null && (
        <div className="text-center text-muted-foreground py-8">
          Select a design above to provide feedback or save
        </div>
      )}
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T16:15:00 | coder@sonnet-4.5 | Design preview page | OK |
/* AGENT FOOTER END */
