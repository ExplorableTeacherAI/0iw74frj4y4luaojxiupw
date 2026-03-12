/**
 * Variables Configuration
 * =======================
 *
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 *
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 *
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /** Correct answer for cloze input validation */
    correctAnswer?: string;
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ─────────────────────────────────────────
    // SECTION 1: Partial Derivatives
    // ─────────────────────────────────────────
    partialX: {
        defaultValue: 1,
        type: 'number',
        label: 'x-coordinate',
        description: 'The x-coordinate for exploring partial derivatives',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#62D0AD',
    },
    partialY: {
        defaultValue: 1,
        type: 'number',
        label: 'y-coordinate',
        description: 'The y-coordinate for exploring partial derivatives',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#8E90F5',
    },

    // ─────────────────────────────────────────
    // SECTION 2: The Counterexample
    // ─────────────────────────────────────────
    approachAngle: {
        defaultValue: 0,
        type: 'number',
        label: 'Approach Angle',
        description: 'The angle of approach to the origin (in degrees)',
        min: 0,
        max: 360,
        step: 5,
        color: '#F7B23B',
    },
    approachDistance: {
        defaultValue: 2,
        type: 'number',
        label: 'Approach Distance',
        description: 'Distance from origin along the approach path',
        min: 0.1,
        max: 3,
        step: 0.1,
        color: '#AC8BF9',
    },

    // ─────────────────────────────────────────
    // SECTION 3: True Differentiability
    // ─────────────────────────────────────────
    tangentPlaneX: {
        defaultValue: 1,
        type: 'number',
        label: 'Point x',
        description: 'x-coordinate for tangent plane visualization',
        min: -2,
        max: 2,
        step: 0.1,
        color: '#62D0AD',
    },
    tangentPlaneY: {
        defaultValue: 1,
        type: 'number',
        label: 'Point y',
        description: 'y-coordinate for tangent plane visualization',
        min: -2,
        max: 2,
        step: 0.1,
        color: '#8E90F5',
    },
    showTangentPlane: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Tangent Plane',
        description: 'Toggle visibility of the tangent plane',
    },

    // ─────────────────────────────────────────
    // SECTION 4: Directional Derivatives
    // ─────────────────────────────────────────
    directionAngle: {
        defaultValue: 45,
        type: 'number',
        label: 'Direction Angle',
        description: 'The angle of the direction vector (in degrees)',
        min: 0,
        max: 360,
        step: 5,
        color: '#F8A0CD',
    },

    // ─────────────────────────────────────────
    // SECTION 5: Continuous Partials
    // ─────────────────────────────────────────
    continuityRadius: {
        defaultValue: 1,
        type: 'number',
        label: 'Neighborhood Radius',
        description: 'Radius of the neighborhood for checking continuity',
        min: 0.1,
        max: 2,
        step: 0.1,
        color: '#62CCF9',
    },

    // ─────────────────────────────────────────
    // LINKED HIGHLIGHTS
    // ─────────────────────────────────────────
    activeHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Active Highlight',
        description: 'Currently highlighted element',
    },
    formulaHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Formula Highlight',
        description: 'Currently highlighted formula term',
    },

    // ─────────────────────────────────────────
    // ASSESSMENT VARIABLES
    // ─────────────────────────────────────────
    answer_partial_meaning: {
        defaultValue: '',
        type: 'text',
        placeholder: '???',
        correctAnswer: 'one',
        color: '#62D0AD',
    },
    answer_counterexample_continuous: {
        defaultValue: '',
        type: 'text',
        placeholder: '???',
        correctAnswer: 'no',
        color: '#F7B23B',
    },
    answer_differentiable_condition: {
        defaultValue: '',
        type: 'text',
        placeholder: '???',
        correctAnswer: 'linear',
        color: '#8E90F5',
    },
    answer_gradient_formula: {
        defaultValue: '',
        type: 'text',
        placeholder: '???',
        correctAnswer: 'gradient',
        color: '#F8A0CD',
    },
    answer_safety_theorem: {
        defaultValue: '',
        type: 'text',
        placeholder: '???',
        correctAnswer: 'continuous',
        color: '#62CCF9',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
