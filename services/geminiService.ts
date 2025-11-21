import { GoogleGenAI, Type } from "@google/genai";
import { CoordSystem } from '../types';

const systemInstruction = `
You are a mathematical assistant for a 3D graphing calculator.
Your goal is to convert natural language descriptions of 3D shapes into mathematical equations.
The calculator supports three modes:
1. Cartesian: z = f(x, y)
2. Spherical: r = f(theta, phi) (where theta is the polar angle [0, pi] from the vertical axis, and phi is the azimuthal angle [0, 2pi])
3. Cylindrical: z = f(r, theta) (where r is radius [0, 10], theta is angle [0, 2pi])

Return a JSON object with the 'expression' (the right-hand side of the equation) and the 'type'.
Keep expressions compatible with standard mathjs syntax (e.g., use 'sqrt()', 'sin()', '^' for power, 'abs()' for absolute value).
You may use '|x|' for absolute value and 'sin^2(x)' syntax as the system pre-processes these.
Use 'pi' for π.

Examples:
User: "A sphere"
Output: { "expression": "5", "type": "spherical" }

User: "Ripple"
Output: { "expression": "sin(x^2 + y^2)", "type": "cartesian" }

User: "Cone"
Output: { "expression": "r", "type": "cylindrical" }

User: "Spiral staircase"
Output: { "expression": "theta / 2", "type": "cylindrical" }

User: "Donut shape"
Output: { "expression": "2 + sin(5 * phi)", "type": "spherical" }
`;

export const generateEquation = async (prompt: string): Promise<{ expression: string; type: CoordSystem } | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            expression: { type: Type.STRING },
            type: { type: Type.STRING, enum: [CoordSystem.CARTESIAN, CoordSystem.SPHERICAL, CoordSystem.CYLINDRICAL] }
          },
          required: ["expression", "type"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    return {
      expression: data.expression,
      type: data.type as CoordSystem
    };

  } catch (error) {
    console.error("Gemini generation error:", error);
    return null;
  }
};