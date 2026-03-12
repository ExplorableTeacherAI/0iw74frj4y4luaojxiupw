import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineClozeInput,
    InlineFormula,
    InlineLinkedHighlight,
    InlineFeedback,
    InlineTooltip,
    Cartesian3D,
    Cartesian2D,
    InteractionHintSequence,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar, useVariableStore, initializeVariableColors } from "@/stores";
import { getDefaultValues, variableDefinitions, numberPropsFromDefinition, getVariableInfo, clozePropsFromDefinition } from "./variables";
import { useEffect, useMemo } from "react";

// Initialize variables
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

/** 3D Visualization for Section 1: Partial Derivatives */
function PartialDerivativesViz() {
    const x0 = useVar('partialX', 1) as number;
    const y0 = useVar('partialY', 1) as number;
    const setVar = useSetVar();

    // f(x, y) = x² + y²
    const f = (x: number, y: number) => x * x + y * y;
    const z0 = f(x0, y0);

    // Partial derivative lines
    const lineLength = 1.5;

    return (
        <div className="relative">
            <Cartesian3D
                height={400}
                cameraPosition={[6, 5, 6]}
                axisLength={4}
                plots={[
                    // The surface f(x,y) = x² + y²
                    {
                        type: "surface",
                        fn: (x, y) => x * x + y * y,
                        xDomain: [-3, 3],
                        yDomain: [-3, 3],
                        resolution: 30,
                        color: "#8E90F5",
                        opacity: 0.6,
                        colorByHeight: true,
                        lowColor: "#62D0AD",
                        highColor: "#8E90F5",
                    },
                    // Point on surface
                    {
                        type: "point",
                        position: [x0, z0, y0],
                        color: "#F7B23B",
                        size: 0.12,
                    },
                    // Line along x-direction (∂f/∂x)
                    {
                        type: "segment",
                        point1: [x0 - lineLength, f(x0 - lineLength, y0), y0],
                        point2: [x0 + lineLength, f(x0 + lineLength, y0), y0],
                        color: "#62D0AD",
                        lineWidth: 4,
                    },
                    // Line along y-direction (∂f/∂y)
                    {
                        type: "segment",
                        point1: [x0, f(x0, y0 - lineLength), y0 - lineLength],
                        point2: [x0, f(x0, y0 + lineLength), y0 + lineLength],
                        color: "#8E90F5",
                        lineWidth: 4,
                    },
                    // Vertical line to show z-value
                    {
                        type: "segment",
                        point1: [x0, 0, y0],
                        point2: [x0, z0, y0],
                        color: "#F7B23B",
                        lineWidth: 2,
                        dashed: true,
                    },
                ]}
                draggablePoints={[
                    {
                        initial: [x0, 0, y0],
                        color: "#F7B23B",
                        size: 0.15,
                        constrain: "xz",
                        onChange: ([newX, , newY]) => {
                            const clampedX = Math.max(-3, Math.min(3, newX));
                            const clampedY = Math.max(-3, Math.min(3, newY));
                            setVar('partialX', Math.round(clampedX * 10) / 10);
                            setVar('partialY', Math.round(clampedY * 10) / 10);
                        },
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="partial-derivatives-3d"
                steps={[
                    { gesture: "drag", label: "Drag the point on the xy-plane" },
                    { gesture: "orbit-3d", label: "Orbit to explore the surface" },
                ]}
            />
        </div>
    );
}

/** Reactive partial derivative values */
function PartialDerivativeValues() {
    const x = useVar('partialX', 1) as number;
    const y = useVar('partialY', 1) as number;
    // For f(x,y) = x² + y²: ∂f/∂x = 2x, ∂f/∂y = 2y
    const dfx = 2 * x;
    const dfy = 2 * y;
    return (
        <>
            At the point ({x.toFixed(1)}, {y.toFixed(1)}), the partial derivatives are ∂f/∂x = {dfx.toFixed(1)} and ∂f/∂y = {dfy.toFixed(1)}.
        </>
    );
}

/** 3D Visualization for Section 2: The Counterexample */
function CounterexampleViz() {
    const angle = useVar('approachAngle', 0) as number;
    const distance = useVar('approachDistance', 2) as number;
    const setVar = useSetVar();

    // Convert angle to radians
    const theta = (angle * Math.PI) / 180;

    // The counterexample function: f(x,y) = xy/(x²+y²) for (x,y)≠(0,0), f(0,0)=0
    const counterexampleFn = (x: number, y: number): number => {
        const r2 = x * x + y * y;
        if (r2 < 0.001) return 0;
        return (x * y) / r2;
    };

    // Compute limit along the approach direction
    // Along line y = mx: f = mx²/(x² + m²x²) = m/(1+m²)
    const m = Math.tan(theta);
    const limitValue = Math.abs(Math.cos(theta)) < 0.001 ? 0 : m / (1 + m * m);

    // Generate approach path points
    const pathPoints: [number, number, number][] = [];
    for (let t = 0; t <= 1; t += 0.05) {
        const d = distance * (1 - t) + 0.05;
        const px = d * Math.cos(theta);
        const py = d * Math.sin(theta);
        const pz = counterexampleFn(px, py);
        pathPoints.push([px, pz, py]);
    }

    // Current position on path
    const currX = distance * Math.cos(theta);
    const currY = distance * Math.sin(theta);
    const currZ = counterexampleFn(currX, currY);

    return (
        <div className="relative">
            <Cartesian3D
                height={400}
                cameraPosition={[4, 3, 4]}
                axisLength={3}
                plots={[
                    // The counterexample surface
                    {
                        type: "surface",
                        fn: counterexampleFn,
                        xDomain: [-2.5, 2.5],
                        yDomain: [-2.5, 2.5],
                        resolution: 50,
                        color: "#F7B23B",
                        opacity: 0.7,
                        wireframe: false,
                    },
                    // Approach path
                    {
                        type: "polyline",
                        points: pathPoints,
                        color: "#ef4444",
                        lineWidth: 3,
                    },
                    // Current point on path
                    {
                        type: "point",
                        position: [currX, currZ, currY],
                        color: "#ef4444",
                        size: 0.12,
                    },
                    // Origin marker
                    {
                        type: "point",
                        position: [0, 0, 0],
                        color: "#22c55e",
                        size: 0.1,
                    },
                    // Limit line (the value approached along this direction)
                    {
                        type: "segment",
                        point1: [0, limitValue, 0],
                        point2: [0.3 * Math.cos(theta), limitValue, 0.3 * Math.sin(theta)],
                        color: "#AC8BF9",
                        lineWidth: 3,
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="counterexample-3d"
                steps={[
                    { gesture: "orbit-3d", label: "Orbit to see the saddle shape" },
                ]}
            />
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                    <strong>Approach angle:</strong> {angle}° → <strong>Limit:</strong> {limitValue.toFixed(3)}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                    Different angles give different limits. This function is not continuous at the origin.
                </p>
            </div>
        </div>
    );
}

/** 3D Visualization for Section 3: True Differentiability (Tangent Plane) */
function TangentPlaneViz() {
    const x0 = useVar('tangentPlaneX', 1) as number;
    const y0 = useVar('tangentPlaneY', 1) as number;
    const setVar = useSetVar();

    // f(x, y) = x² + y² (a nice differentiable function)
    const f = (x: number, y: number) => x * x + y * y;
    const z0 = f(x0, y0);

    // Partial derivatives: ∂f/∂x = 2x, ∂f/∂y = 2y
    const fx = 2 * x0;
    const fy = 2 * y0;

    // Tangent plane: z = f(x0,y0) + fx(x-x0) + fy(y-y0)
    const tangentPlaneFn = (x: number, y: number) => z0 + fx * (x - x0) + fy * (y - y0);

    return (
        <div className="relative">
            <Cartesian3D
                height={450}
                cameraPosition={[5, 4, 5]}
                axisLength={3}
                plots={[
                    // The surface
                    {
                        type: "surface",
                        fn: f,
                        xDomain: [-2, 2],
                        yDomain: [-2, 2],
                        resolution: 30,
                        color: "#8E90F5",
                        opacity: 0.6,
                        highlightId: "surface",
                    },
                    // The tangent plane
                    {
                        type: "surface",
                        fn: tangentPlaneFn,
                        xDomain: [x0 - 1.2, x0 + 1.2],
                        yDomain: [y0 - 1.2, y0 + 1.2],
                        resolution: 10,
                        color: "#22c55e",
                        opacity: 0.5,
                        highlightId: "tangentPlane",
                    },
                    // Point of tangency
                    {
                        type: "point",
                        position: [x0, z0, y0],
                        color: "#F7B23B",
                        size: 0.12,
                        highlightId: "tangentPoint",
                    },
                    // Gradient vector (scaled for visibility)
                    {
                        type: "vector",
                        tail: [x0, z0, y0],
                        tip: [x0 + fx * 0.2, z0 + 0.4, y0 + fy * 0.2],
                        color: "#ef4444",
                        highlightId: "gradient",
                    },
                ]}
                draggablePoints={[
                    {
                        initial: [x0, 0, y0],
                        color: "#F7B23B",
                        size: 0.15,
                        constrain: "xz",
                        onChange: ([newX, , newY]) => {
                            const clampedX = Math.max(-2, Math.min(2, newX));
                            const clampedY = Math.max(-2, Math.min(2, newY));
                            setVar('tangentPlaneX', Math.round(clampedX * 10) / 10);
                            setVar('tangentPlaneY', Math.round(clampedY * 10) / 10);
                        },
                    },
                ]}
                highlightVarName="activeHighlight"
            />
            <InteractionHintSequence
                hintKey="tangent-plane-3d"
                steps={[
                    { gesture: "drag", label: "Drag the point to move the tangent plane" },
                    { gesture: "orbit-3d", label: "Orbit to see how well the plane approximates" },
                ]}
            />
        </div>
    );
}

/** Reactive tangent plane equation */
function TangentPlaneEquation() {
    const x0 = useVar('tangentPlaneX', 1) as number;
    const y0 = useVar('tangentPlaneY', 1) as number;
    const z0 = x0 * x0 + y0 * y0;
    const fx = 2 * x0;
    const fy = 2 * y0;

    return (
        <span className="font-mono text-sm">
            z = {z0.toFixed(2)} + {fx.toFixed(1)}(x - {x0.toFixed(1)}) + {fy.toFixed(1)}(y - {y0.toFixed(1)})
        </span>
    );
}

/** 2D Visualization for Section 4: Directional Derivatives */
function DirectionalDerivativeViz() {
    const angle = useVar('directionAngle', 45) as number;
    const setVar = useSetVar();

    // Convert to radians
    const theta = (angle * Math.PI) / 180;

    // Unit direction vector
    const ux = Math.cos(theta);
    const uy = Math.sin(theta);

    // For f(x,y) = x² + y² at point (1,1):
    // Gradient = (2, 2)
    // Directional derivative = grad · u = 2*cos(θ) + 2*sin(θ)
    const gradX = 2;
    const gradY = 2;
    const directionalDeriv = gradX * ux + gradY * uy;

    return (
        <div className="relative">
            <Cartesian2D
                height={350}
                xDomain={[-2, 3]}
                yDomain={[-2, 3]}
                showGrid={true}
                plots={[
                    // Contour lines of f(x,y) = x² + y²
                    ...[1, 2, 4, 6].map((c) => ({
                        type: "function" as const,
                        fn: (x: number) => Math.sqrt(Math.max(0, c - x * x)),
                        color: "#e5e7eb",
                        strokeWidth: 1,
                    })),
                    ...[1, 2, 4, 6].map((c) => ({
                        type: "function" as const,
                        fn: (x: number) => -Math.sqrt(Math.max(0, c - x * x)),
                        color: "#e5e7eb",
                        strokeWidth: 1,
                    })),
                    // Point (1, 1)
                    {
                        type: "point" as const,
                        position: [1, 1] as [number, number],
                        color: "#F7B23B",
                    },
                    // Gradient vector (scaled)
                    {
                        type: "vector" as const,
                        tail: [1, 1] as [number, number],
                        tip: [1 + gradX * 0.3, 1 + gradY * 0.3] as [number, number],
                        color: "#ef4444",
                        highlightId: "gradientVec",
                    },
                    // Direction vector
                    {
                        type: "vector" as const,
                        tail: [1, 1] as [number, number],
                        tip: [1 + ux * 0.8, 1 + uy * 0.8] as [number, number],
                        color: "#F8A0CD",
                        highlightId: "directionVec",
                    },
                ]}
                movablePoints={[
                    {
                        id: "direction-control",
                        initialPosition: [1 + Math.cos(theta), 1 + Math.sin(theta)],
                        color: "#F8A0CD",
                        constrain: (point) => {
                            // Constrain to unit circle around (1,1)
                            const dx = point[0] - 1;
                            const dy = point[1] - 1;
                            const len = Math.sqrt(dx * dx + dy * dy);
                            if (len < 0.1) return [2, 1];
                            return [1 + dx / len, 1 + dy / len];
                        },
                        onMove: (point) => {
                            const dx = point[0] - 1;
                            const dy = point[1] - 1;
                            let newAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                            if (newAngle < 0) newAngle += 360;
                            setVar('directionAngle', Math.round(newAngle / 5) * 5);
                        },
                    },
                ]}
                highlightVarName="activeHighlight"
            />
            <InteractionHintSequence
                hintKey="directional-derivative-2d"
                steps={[
                    { gesture: "drag-circular", label: "Drag the pink point around the circle", position: { x: "70%", y: "30%" } },
                ]}
            />
            <div className="mt-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-sm text-pink-800">
                    <strong>Direction:</strong> ({ux.toFixed(2)}, {uy.toFixed(2)}) at {angle}°
                </p>
                <p className="text-sm text-pink-800">
                    <strong>Directional derivative:</strong> ∇f · u = {directionalDeriv.toFixed(2)}
                </p>
            </div>
        </div>
    );
}

/** 3D Visualization for Section 5: Continuous Partials */
function ContinuousPartialsViz() {
    const radius = useVar('continuityRadius', 1) as number;

    // A differentiable function: f(x,y) = sin(x)cos(y)
    const f = (x: number, y: number) => Math.sin(x) * Math.cos(y);

    // Generate sample points for partial derivative visualization
    const samplePoints: [number, number, number][] = [];
    const numSamples = 8;
    for (let i = 0; i < numSamples; i++) {
        const theta = (2 * Math.PI * i) / numSamples;
        const px = radius * Math.cos(theta);
        const py = radius * Math.sin(theta);
        samplePoints.push([px, f(px, py), py]);
    }

    return (
        <div className="relative">
            <Cartesian3D
                height={400}
                cameraPosition={[5, 4, 5]}
                axisLength={3}
                plots={[
                    // The smooth surface
                    {
                        type: "surface",
                        fn: f,
                        xDomain: [-3, 3],
                        yDomain: [-3, 3],
                        resolution: 40,
                        color: "#62CCF9",
                        opacity: 0.7,
                        colorByHeight: true,
                        lowColor: "#62CCF9",
                        highColor: "#8E90F5",
                    },
                    // Circle on xy-plane showing neighborhood
                    {
                        type: "parametric",
                        xyz: (t) => [radius * Math.cos(t), 0, radius * Math.sin(t)],
                        tRange: [0, 2 * Math.PI],
                        color: "#F7B23B",
                        lineWidth: 3,
                    },
                    // Sample points on surface
                    ...samplePoints.map((pt, i) => ({
                        type: "point" as const,
                        position: pt,
                        color: "#22c55e",
                        size: 0.08,
                    })),
                    // Origin point
                    {
                        type: "point",
                        position: [0, f(0, 0), 0],
                        color: "#ef4444",
                        size: 0.12,
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="continuous-partials-3d"
                steps={[
                    { gesture: "orbit-3d", label: "Orbit to see the smooth surface" },
                ]}
            />
            <div className="mt-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
                <p className="text-sm text-sky-800">
                    The partial derivatives of sin(x)cos(y) are cos(x)cos(y) and -sin(x)sin(y), both continuous everywhere.
                </p>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCKS
// ═══════════════════════════════════════════════════════════════════════════════

export const blocks: ReactElement[] = [
    // ════════════════════════════════════════════════════════════════════════════
    // TITLE
    // ════════════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-title" maxWidth="xl">
        <Block id="title" padding="lg">
            <EditableH1 id="h1-title" blockId="title">
                Subtleties of Differentiability in Higher Dimensions
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro" maxWidth="xl">
        <Block id="intro" padding="sm">
            <EditableParagraph id="para-intro" blockId="intro">
                In single-variable calculus, differentiability is straightforward: if a function has a derivative at a point, it must be continuous there, and the tangent line approximates the function well. But in higher dimensions, the situation becomes far more subtle. A function can have all its partial derivatives exist at a point and yet fail to be continuous there. This lesson explores why partial derivatives alone are not enough, and what true differentiability really means.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 1: The Familiar Story — Partial Derivatives
    // ════════════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-section1-header" maxWidth="xl">
        <Block id="section1-header" padding="md">
            <EditableH2 id="h2-section1" blockId="section1-header">
                1. The Familiar Story: Partial Derivatives
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section1-intro" maxWidth="xl">
        <Block id="section1-intro" padding="sm">
            <EditableParagraph id="para-section1-intro" blockId="section1-intro">
                When we move from functions of one variable to functions of two (or more) variables, the first natural question is: how do we measure rates of change? The answer seems simple enough. We freeze all variables except one and differentiate as usual.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-section1-viz" ratio="1:1" gap="lg">
        <Block id="section1-text" padding="sm">
            <EditableParagraph id="para-section1-explanation" blockId="section1-text">
                Consider the paraboloid{" "}
                <InlineFormula
                    id="formula-paraboloid"
                    latex="f(x, y) = x^2 + y^2"
                />.{" "}
                The{" "}
                <InlineLinkedHighlight
                    id="highlight-partial-x"
                    varName="activeHighlight"
                    highlightId="partialX"
                    color="#62D0AD"
                >
                    partial derivative with respect to x
                </InlineLinkedHighlight>{" "}
                measures how fast f changes as we move parallel to the x-axis, holding y fixed. The{" "}
                <InlineLinkedHighlight
                    id="highlight-partial-y"
                    varName="activeHighlight"
                    highlightId="partialY"
                    color="#8E90F5"
                >
                    partial derivative with respect to y
                </InlineLinkedHighlight>{" "}
                measures change along the y-axis.
            </EditableParagraph>
            <EditableParagraph id="para-section1-drag" blockId="section1-text">
                Drag the amber point on the xy-plane in the visualization. Watch how the{" "}
                <span style={{ color: "#62D0AD" }}>teal line</span> shows the slope in the x-direction and the{" "}
                <span style={{ color: "#8E90F5" }}>indigo line</span> shows the slope in the y-direction. <PartialDerivativeValues />
            </EditableParagraph>
        </Block>
        <Block id="section1-viz" padding="sm" hasVisualization>
            <PartialDerivativesViz />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-section1-formula" maxWidth="xl">
        <Block id="section1-formula" padding="md">
            <FormulaBlock
                latex="\frac{\partial f}{\partial x} = 2\scrub{partialX}, \quad \frac{\partial f}{\partial y} = 2\scrub{partialY}"
                variables={{
                    partialX: { min: -3, max: 3, step: 0.1, color: "#62D0AD" },
                    partialY: { min: -3, max: 3, step: 0.1, color: "#8E90F5" },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section1-insight" maxWidth="xl">
        <Block id="section1-insight" padding="sm">
            <EditableParagraph id="para-section1-insight" blockId="section1-insight">
                These partial derivatives only tell us about rates of change along the coordinate axes. But a crucial question emerges: if both partial derivatives exist at a point, does that mean the function is "differentiable" there? In one dimension, having a derivative implies continuity. Does having partial derivatives imply continuity in higher dimensions?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 2: The Surprise — When Partials Lie
    // ════════════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-section2-header" maxWidth="xl">
        <Block id="section2-header" padding="md">
            <EditableH2 id="h2-section2" blockId="section2-header">
                2. The Surprise: When Partials Lie
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section2-intro" maxWidth="xl">
        <Block id="section2-intro" padding="sm">
            <EditableParagraph id="para-section2-intro" blockId="section2-intro">
                Here is the surprising truth: having partial derivatives exist does not guarantee continuity, let alone differentiability. Consider the famous counterexample:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section2-formula" maxWidth="xl">
        <Block id="section2-formula" padding="md">
            <FormulaBlock
                latex="f(x, y) = \begin{cases} \dfrac{xy}{x^2 + y^2} & (x, y) \neq (0, 0) \\ 0 & (x, y) = (0, 0) \end{cases}"
                colorMap={{ xy: "#F7B23B" }}
            />
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-section2-viz" ratio="1:1" gap="lg">
        <Block id="section2-text" padding="sm">
            <EditableParagraph id="para-section2-partials" blockId="section2-text">
                Along the x-axis (where y = 0), this function equals zero for all x. So the partial derivative with respect to x at the origin is zero. Similarly, along the y-axis (where x = 0), the function is zero, so the partial derivative with respect to y is also zero. Both partial derivatives exist at the origin!
            </EditableParagraph>
            <EditableParagraph id="para-section2-problem" blockId="section2-text">
                But look what happens when we approach the origin from different directions. Scrub the approach angle below and watch the limit value change.
            </EditableParagraph>
            <EditableParagraph id="para-section2-angle" blockId="section2-text">
                Approach angle:{" "}
                <InlineScrubbleNumber
                    id="scrub-approach-angle"
                    varName="approachAngle"
                    {...numberPropsFromDefinition(getVariableInfo('approachAngle'))}
                    formatValue={(v) => `${v}°`}
                />
            </EditableParagraph>
        </Block>
        <Block id="section2-viz" padding="sm" hasVisualization>
            <CounterexampleViz />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-section2-conclusion" maxWidth="xl">
        <Block id="section2-conclusion" padding="sm">
            <EditableParagraph id="para-section2-conclusion" blockId="section2-conclusion">
                Along the line y = x, the limit is 1/2. Along y = -x, the limit is -1/2. Along the axes, the limit is 0. Since the limit depends on the direction of approach, the function is not continuous at the origin. Yet both partial derivatives exist there! This counterexample reveals a fundamental truth: partial derivatives only probe the function along the coordinate axes, missing what happens in between.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 3: What Differentiability Really Means
    // ════════════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-section3-header" maxWidth="xl">
        <Block id="section3-header" padding="md">
            <EditableH2 id="h2-section3" blockId="section3-header">
                3. What Differentiability Really Means
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section3-intro" maxWidth="xl">
        <Block id="section3-intro" padding="sm">
            <EditableParagraph id="para-section3-intro" blockId="section3-intro">
                True differentiability requires much more than just having partial derivatives. A function f(x, y) is differentiable at a point (a, b) if there exists a{" "}
                <InlineLinkedHighlight
                    id="highlight-tangent-plane"
                    varName="activeHighlight"
                    highlightId="tangentPlane"
                    color="#22c55e"
                >
                    tangent plane
                </InlineLinkedHighlight>{" "}
                that approximates the function well from every direction, not just along the axes.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section3-definition" maxWidth="xl">
        <Block id="section3-definition" padding="md">
            <FormulaBlock
                latex="f(a + h, b + k) = f(a, b) + \clr{fx}{f_x}h + \clr{fy}{f_y}k + \clr{error}{\epsilon(h, k)}"
                colorMap={{ fx: "#62D0AD", fy: "#8E90F5", error: "#ef4444" }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section3-error" maxWidth="xl">
        <Block id="section3-error" padding="sm">
            <EditableParagraph id="para-section3-error" blockId="section3-error">
                where the{" "}
                <span style={{ color: "#ef4444" }}>error term</span>{" "}
                ε(h, k) goes to zero faster than the distance √(h² + k²) as (h, k) → (0, 0). This is the key requirement: the linear approximation (the tangent plane) must work well in all directions simultaneously.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-section3-viz" ratio="1:1" gap="lg">
        <Block id="section3-text" padding="sm">
            <EditableParagraph id="para-section3-drag" blockId="section3-text">
                Drag the amber point to move across the paraboloid f(x, y) = x² + y². Notice how the{" "}
                <InlineLinkedHighlight
                    id="highlight-tangent-plane-text"
                    varName="activeHighlight"
                    highlightId="tangentPlane"
                    color="#22c55e"
                >
                    green tangent plane
                </InlineLinkedHighlight>{" "}
                always stays "kissing" the surface at exactly one point. The{" "}
                <InlineLinkedHighlight
                    id="highlight-gradient-text"
                    varName="activeHighlight"
                    highlightId="gradient"
                    color="#ef4444"
                >
                    red arrow
                </InlineLinkedHighlight>{" "}
                shows the gradient vector, which is perpendicular to the level curves.
            </EditableParagraph>
            <EditableParagraph id="para-section3-equation" blockId="section3-text">
                Current tangent plane: <TangentPlaneEquation />
            </EditableParagraph>
            <EditableParagraph id="para-section3-controls" blockId="section3-text">
                Point:{" "}
                x = <InlineScrubbleNumber
                    id="scrub-tangent-x"
                    varName="tangentPlaneX"
                    {...numberPropsFromDefinition(getVariableInfo('tangentPlaneX'))}
                />,{" "}
                y = <InlineScrubbleNumber
                    id="scrub-tangent-y"
                    varName="tangentPlaneY"
                    {...numberPropsFromDefinition(getVariableInfo('tangentPlaneY'))}
                />
            </EditableParagraph>
        </Block>
        <Block id="section3-viz" padding="sm" hasVisualization>
            <TangentPlaneViz />
        </Block>
    </SplitLayout>,

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 4: The Full Picture — Directional Derivatives
    // ════════════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-section4-header" maxWidth="xl">
        <Block id="section4-header" padding="md">
            <EditableH2 id="h2-section4" blockId="section4-header">
                4. The Full Picture: Directional Derivatives
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section4-intro" maxWidth="xl">
        <Block id="section4-intro" padding="sm">
            <EditableParagraph id="para-section4-intro" blockId="section4-intro">
                If a function is truly differentiable at a point, then directional derivatives exist in all directions and are completely determined by the gradient. The directional derivative in the direction of a unit vector u is given by:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section4-formula" maxWidth="xl">
        <Block id="section4-formula" padding="md">
            <FormulaBlock
                latex="D_{\mathbf{u}}f = \nabla f \cdot \mathbf{u} = \clr{fx}{f_x}\cos\theta + \clr{fy}{f_y}\sin\theta"
                colorMap={{ fx: "#62D0AD", fy: "#8E90F5" }}
            />
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-section4-viz" ratio="1:1" gap="lg">
        <Block id="section4-text" padding="sm">
            <EditableParagraph id="para-section4-explanation" blockId="section4-text">
                For f(x, y) = x² + y² at the point (1, 1), the{" "}
                <InlineLinkedHighlight
                    id="highlight-gradient-vec"
                    varName="activeHighlight"
                    highlightId="gradientVec"
                    color="#ef4444"
                >
                    gradient ∇f = (2, 2)
                </InlineLinkedHighlight>{" "}
                points in the direction of steepest ascent. Drag the{" "}
                <InlineLinkedHighlight
                    id="highlight-direction-vec"
                    varName="activeHighlight"
                    highlightId="directionVec"
                    color="#F8A0CD"
                >
                    pink direction vector
                </InlineLinkedHighlight>{" "}
                around the circle to see how the directional derivative changes.
            </EditableParagraph>
            <EditableParagraph id="para-section4-angle" blockId="section4-text">
                Direction angle:{" "}
                <InlineScrubbleNumber
                    id="scrub-direction-angle"
                    varName="directionAngle"
                    {...numberPropsFromDefinition(getVariableInfo('directionAngle'))}
                    formatValue={(v) => `${v}°`}
                />
            </EditableParagraph>
            <EditableParagraph id="para-section4-insight" blockId="section4-text">
                Notice that the directional derivative is maximized when the direction vector aligns with the gradient (at 45°), and is zero when perpendicular to the gradient. This is because the gradient points toward the steepest increase.
            </EditableParagraph>
        </Block>
        <Block id="section4-viz" padding="sm" hasVisualization>
            <DirectionalDerivativeViz />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-section4-warning" maxWidth="xl">
        <Block id="section4-warning" padding="sm">
            <EditableParagraph id="para-section4-warning" blockId="section4-warning">
                <strong>Important:</strong> Even if directional derivatives exist in all directions, the function might still not be differentiable! The counterexample from Section 2 has directional derivatives in every direction at the origin (they just do not combine linearly). Differentiability requires something stronger: that these directional derivatives be given by the formula above for some fixed gradient vector.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 5: The Safety Net — Continuous Partials
    // ════════════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-section5-header" maxWidth="xl">
        <Block id="section5-header" padding="md">
            <EditableH2 id="h2-section5" blockId="section5-header">
                5. The Safety Net: Continuous Partials
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section5-intro" maxWidth="xl">
        <Block id="section5-intro" padding="sm">
            <EditableParagraph id="para-section5-intro" blockId="section5-intro">
                After all these subtleties, you might wonder: is there a practical condition that guarantees differentiability? Yes! If the partial derivatives exist in a neighborhood of a point and are continuous at that point, then the function is differentiable there.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-section5-theorem" maxWidth="xl">
        <Block id="section5-theorem" padding="md">
            <div className="p-4 bg-sky-50 border-l-4 border-sky-500 rounded-r-lg">
                <EditableH3 id="h3-theorem" blockId="section5-theorem">
                    Theorem (Sufficient Condition for Differentiability)
                </EditableH3>
                <EditableParagraph id="para-theorem" blockId="section5-theorem">
                    If the partial derivatives f_x and f_y exist in an open region containing (a, b) and are continuous at (a, b), then f is differentiable at (a, b).
                </EditableParagraph>
            </div>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-section5-viz" ratio="1:1" gap="lg">
        <Block id="section5-text" padding="sm">
            <EditableParagraph id="para-section5-example" blockId="section5-text">
                Consider f(x, y) = sin(x)cos(y). Its partial derivatives are f_x = cos(x)cos(y) and f_y = -sin(x)sin(y). Both are continuous everywhere (as compositions of continuous functions), so this function is differentiable at every point.
            </EditableParagraph>
            <EditableParagraph id="para-section5-contrast" blockId="section5-text">
                Contrast this with our counterexample from Section 2. There, the partial derivatives existed at the origin but were not continuous there. The theorem gives us a practical test: check if the partial derivatives are continuous.
            </EditableParagraph>
            <EditableParagraph id="para-section5-radius" blockId="section5-text">
                Neighborhood radius:{" "}
                <InlineScrubbleNumber
                    id="scrub-continuity-radius"
                    varName="continuityRadius"
                    {...numberPropsFromDefinition(getVariableInfo('continuityRadius'))}
                />
            </EditableParagraph>
        </Block>
        <Block id="section5-viz" padding="sm" hasVisualization>
            <ContinuousPartialsViz />
        </Block>
    </SplitLayout>,

    // ════════════════════════════════════════════════════════════════════════════
    // SUMMARY
    // ════════════════════════════════════════════════════════════════════════════
    <StackLayout key="layout-summary-header" maxWidth="xl">
        <Block id="summary-header" padding="md">
            <EditableH2 id="h2-summary" blockId="summary-header">
                Summary
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-summary" maxWidth="xl">
        <Block id="summary" padding="sm">
            <EditableParagraph id="para-summary" blockId="summary">
                The path from partial derivatives to true differentiability in higher dimensions is surprisingly subtle:
            </EditableParagraph>
            <div className="mt-4 space-y-3">
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm"><strong>1. Partial derivatives exist</strong> → Not enough for continuity or differentiability</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm"><strong>2. All directional derivatives exist</strong> → Still not enough for differentiability</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm"><strong>3. True differentiability</strong> → Requires a linear approximation that works in ALL directions</p>
                </div>
                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                    <p className="text-sm"><strong>4. Continuous partial derivatives</strong> → Guarantees differentiability (the practical test)</p>
                </div>
            </div>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-final" maxWidth="xl">
        <Block id="final" padding="sm">
            <EditableParagraph id="para-final" blockId="final">
                Understanding these distinctions is crucial for multivariable calculus. The next time you compute partial derivatives, remember: you are only seeing the function along the coordinate axes. True differentiability requires the function to behave nicely when approached from any direction.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
