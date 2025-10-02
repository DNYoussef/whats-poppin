// ============================================================================
// What's Poppin! - AI Page Designer
// File: src/lib/ai/page-designer.ts
// Description: Generate interactive 3D event pages using AI
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { getOpenAIClient } from '../openai';
import type { Event } from '@/types/database.types';

// ============================================================================
// TYPES
// ============================================================================

export interface DesignTheme {
  name: 'Minimal' | 'Bold' | 'Immersive';
  description: string;
}

export interface Design3DSpec {
  theme: DesignTheme['name'];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  particles: {
    count: number;
    size: number;
    colors: string[];
    movement: 'wind' | 'float' | 'orbit' | 'static';
    speed: number;
  };
  lighting: {
    ambient: {
      intensity: number;
      color: string;
    };
    spotlights: Array<{
      position: [number, number, number];
      angle: number;
      intensity: number;
      penumbra: number;
      color: string;
    }>;
  };
  camera: {
    position: [number, number, number];
    animation: 'static' | 'orbit' | 'zoom' | 'dolly';
    speed: number;
  };
  centerpiece: {
    type: 'sphere' | 'box' | 'torus';
    size: number;
    position: [number, number, number];
    material: {
      type: 'standard' | 'phong' | 'glass';
      color: string;
      opacity: number;
      metalness?: number;
      roughness?: number;
      shininess?: number;
    };
    animation: 'rotate' | 'pulse' | 'morph' | 'none';
  };
  text: {
    titleSize: number;
    titleAnimation: 'float' | 'pulse' | 'none';
    descriptionVisible: boolean;
  };
}

export interface EventPageDesign {
  id: string;
  theme: DesignTheme['name'];
  spec: Design3DSpec;
  reasoning: string;
  preview_image?: string;
}

// ============================================================================
// DESIGN GENERATION
// ============================================================================

/**
 * Generate 3 AI-designed interactive event pages
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function generateEventDesigns(
  event: Partial<Event>
): Promise<EventPageDesign[]> {
  // Assertion 1: Validate event
  if (!event || !event.title) {
    throw new Error('Event with title is required');
  }

  // Assertion 2: Validate event data
  if (!event.category || !event.description) {
    throw new Error('Event must have category and description');
  }

  const openai = getOpenAIClient();

  const prompt = `You are an expert 3D web designer. Create 3 distinct interactive page designs for this event using Three.js.

Event Details:
- Title: ${event.title}
- Category: ${event.category}
- Description: ${event.description}
- Vibe: ${getEventVibe(event)}

Generate 3 designs with different themes:
1. **Minimal**: Clean, professional, subtle animations, pastel colors
2. **Bold**: Vibrant, energetic, dynamic movement, saturated colors
3. **Immersive**: Full 3D experience, complex animations, atmospheric

For EACH design, provide a JSON object with this EXACT structure:
{
  "theme": "Minimal" | "Bold" | "Immersive",
  "reasoning": "Why this design fits the event (2-3 sentences)",
  "spec": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex"
    },
    "particles": {
      "count": number (500-3000),
      "size": number (0.05-0.2),
      "colors": ["#hex", "#hex", "#hex"],
      "movement": "wind" | "float" | "orbit" | "static",
      "speed": number (0.5-2.0)
    },
    "lighting": {
      "ambient": {
        "intensity": number (0.3-0.8),
        "color": "#hex"
      },
      "spotlights": [
        {"position": [x, y, z], "angle": number, "intensity": number, "penumbra": number, "color": "#hex"}
      ]
    },
    "camera": {
      "position": [x, y, z],
      "animation": "static" | "orbit" | "zoom" | "dolly",
      "speed": number (0.1-1.0)
    },
    "centerpiece": {
      "type": "sphere" | "box" | "torus",
      "size": number (0.5-2.0),
      "position": [x, y, z],
      "material": {
        "type": "standard" | "phong" | "glass",
        "color": "#hex",
        "opacity": number (0.3-1.0),
        "metalness": number (0-1),
        "roughness": number (0-1),
        "shininess": number (0-100)
      },
      "animation": "rotate" | "pulse" | "morph" | "none"
    },
    "text": {
      "titleSize": number (0.5-1.5),
      "titleAnimation": "float" | "pulse" | "none",
      "descriptionVisible": boolean
    }
  }
}

Return ONLY a JSON array with 3 design objects. No other text.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 2000
  });

  const content = response.choices[0]?.message?.content || '[]';

  try {
    const designs = JSON.parse(content);

    if (!Array.isArray(designs) || designs.length !== 3) {
      throw new Error('Expected 3 designs');
    }

    return designs.map((design, idx) => ({
      id: `design-${idx + 1}`,
      theme: design.theme,
      spec: design.spec,
      reasoning: design.reasoning
    }));
  } catch (error) {
    console.error('Failed to parse AI designs:', error);
    return getDefaultDesigns(event);
  }
}

/**
 * Refine a design based on user feedback
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function refineDesign(
  currentDesign: EventPageDesign,
  feedback: string
): Promise<EventPageDesign> {
  // Assertion 1: Validate design
  if (!currentDesign || !currentDesign.spec) {
    throw new Error('Valid current design is required');
  }

  // Assertion 2: Validate feedback
  if (!feedback || feedback.trim().length === 0) {
    throw new Error('Feedback cannot be empty');
  }

  const openai = getOpenAIClient();

  const prompt = `You are refining a 3D event page design based on user feedback.

Current Design (${currentDesign.theme}):
${JSON.stringify(currentDesign.spec, null, 2)}

User Feedback: "${feedback}"

Modify the design to incorporate this feedback. Return ONLY the updated design spec as JSON with the same structure. Keep the theme name but adjust the spec.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500
  });

  const content = response.choices[0]?.message?.content || '{}';

  try {
    const refined = JSON.parse(content);

    return {
      ...currentDesign,
      spec: refined.spec || refined,
      reasoning: `${currentDesign.reasoning} • Updated based on your feedback`
    };
  } catch (error) {
    console.error('Failed to parse refined design:', error);
    return currentDesign;
  }
}

/**
 * Determine event vibe from details
 */
function getEventVibe(event: Partial<Event>): string {
  const category = event.category?.toLowerCase() || '';
  const description = event.description?.toLowerCase() || '';

  if (category.includes('music') || description.includes('concert')) {
    return 'energetic and musical';
  }
  if (category.includes('food') || description.includes('tasting')) {
    return 'sophisticated and appetizing';
  }
  if (category.includes('sports')) {
    return 'dynamic and competitive';
  }
  if (category.includes('art')) {
    return 'creative and expressive';
  }
  if (category.includes('nightlife')) {
    return 'vibrant and exciting';
  }

  return 'engaging and welcoming';
}

/**
 * Fallback default designs if AI fails
 */
function getDefaultDesigns(event: Partial<Event>): EventPageDesign[] {
  const baseColors = {
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: '#0a0a0a'
  };

  return [
    {
      id: 'design-1',
      theme: 'Minimal',
      reasoning: 'Clean and professional design that lets content shine',
      spec: {
        theme: 'Minimal',
        colors: { ...baseColors, primary: '#6366f1' },
        particles: {
          count: 800,
          size: 0.08,
          colors: ['#6366f1', '#8b5cf6'],
          movement: 'float',
          speed: 0.02
        },
        lighting: {
          ambient: { intensity: 0.6, color: '#ffffff' },
          spotlights: [
            { position: [5, 5, 5], angle: 0.5, intensity: 0.5, penumbra: 0.5, color: '#ffffff' }
          ]
        },
        camera: {
          position: [0, 0, 8],
          animation: 'static',
          speed: 0.5
        },
        centerpiece: {
          type: 'sphere',
          size: 1.5,
          position: [0, 0, 0],
          material: {
            type: 'glass',
            color: '#6366f1',
            opacity: 0.8,
            metalness: 0.1,
            roughness: 0.1
          },
          animation: 'rotate'
        },
        text: {
          titleSize: 1.0,
          titleAnimation: 'float',
          descriptionVisible: true
        }
      }
    },
    {
      id: 'design-2',
      theme: 'Bold',
      reasoning: 'Eye-catching design with vibrant energy and movement',
      spec: {
        theme: 'Bold',
        colors: { ...baseColors },
        particles: {
          count: 2000,
          size: 0.12,
          colors: ['#f59e0b', '#ec4899', '#8b5cf6'],
          movement: 'orbit',
          speed: 1.5
        },
        lighting: {
          ambient: { intensity: 0.4, color: '#ffffff' },
          spotlights: [
            { position: [5, 5, 5], angle: 0.6, intensity: 0.8, penumbra: 0.3, color: '#f59e0b' },
            { position: [-5, -5, 5], angle: 0.6, intensity: 0.6, penumbra: 0.3, color: '#ec4899' }
          ]
        },
        camera: {
          position: [0, 0, 10],
          animation: 'orbit',
          speed: 0.5
        },
        centerpiece: {
          type: 'torus',
          size: 1.8,
          position: [0, 0, 0],
          material: {
            type: 'standard',
            color: '#f59e0b',
            opacity: 0.9,
            metalness: 0.8,
            roughness: 0.2
          },
          animation: 'pulse'
        },
        text: {
          titleSize: 1.2,
          titleAnimation: 'pulse',
          descriptionVisible: true
        }
      }
    },
    {
      id: 'design-3',
      theme: 'Immersive',
      reasoning: 'Fully immersive 3D experience with atmospheric effects',
      spec: {
        theme: 'Immersive',
        colors: { ...baseColors, background: '#050505' },
        particles: {
          count: 3000,
          size: 0.15,
          colors: ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b'],
          movement: 'wind',
          speed: 2.0
        },
        lighting: {
          ambient: { intensity: 0.3, color: '#1a1a2e' },
          spotlights: [
            { position: [10, 10, 10], angle: 0.4, intensity: 1.0, penumbra: 0.2, color: '#8b5cf6' },
            { position: [-10, 5, 10], angle: 0.5, intensity: 0.8, penumbra: 0.3, color: '#ec4899' },
            { position: [0, -10, 5], angle: 0.6, intensity: 0.6, penumbra: 0.4, color: '#f59e0b' }
          ]
        },
        camera: {
          position: [0, 2, 12],
          animation: 'dolly',
          speed: 0.8
        },
        centerpiece: {
          type: 'box',
          size: 2.0,
          position: [0, 0, 0],
          material: {
            type: 'glass',
            color: '#8b5cf6',
            opacity: 0.6,
            metalness: 0.2,
            roughness: 0.1
          },
          animation: 'morph'
        },
        text: {
          titleSize: 1.3,
          titleAnimation: 'float',
          descriptionVisible: false
        }
      }
    }
  ];
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:00:00 | coder@sonnet-4.5 | AI page designer service | OK |
/* AGENT FOOTER END */
