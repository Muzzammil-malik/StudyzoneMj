import { Resource } from '../types/resource';
import { Subject } from '../types/subject';
import { Folder } from '../types/folder';

export interface AcademicDocPage {
  pageNumber: number;
  sectionTitle: string;
  paragraphs: string[];
  keyFormulas?: string[];
  keyPoints?: string[];
  workedExample?: {
    problem: string;
    solution: string[];
  };
}

export interface AcademicDocumentContent {
  institution: string;
  course: string;
  subjectTitle: string;
  unitTitle: string;
  documentTitle: string;
  author: string;
  academicYear: string;
  totalPages: number;
  pages: AcademicDocPage[];
}

/**
 * Generates structured academic text content matching the resource metadata
 * for the realistic client-side PDF viewer and printable canvas.
 */
export function generateAcademicDocContent(
  resource: Resource,
  subject?: Subject,
  folder?: Folder
): AcademicDocumentContent {
  const totalPages = resource.pageCount || 6;
  const pages: AcademicDocPage[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1) {
      pages.push({
        pageNumber: 1,
        sectionTitle: '1. Overview & Theoretical Framework',
        paragraphs: [
          `This academic resource was prepared for ${subject?.name || 'Academic Studies'} at Muffakham Jah College of Engineering & Technology (MJCET).`,
          `Topic Focus: ${resource.name.replace('.pdf', '')}. ${resource.description || 'Covers core principles, governing mathematical equations, experimental proofs, and examination questions.'}`,
          'Students are advised to review the preliminary concepts thoroughly before proceeding with the analytical derivations and numerical simulations.',
        ],
        keyPoints: [
          'Governing principles verified according to the Osmania University syllabus curriculum.',
          'Special emphasis on high-weightage semester examination questions and internal midterms.',
          'Diagrams and schematics are standardized for clear presentation in answer scripts.',
        ],
        keyFormulas: [
          'Condition for Maxima / Constructive interference: Δ = nλ (where n = 0, 1, 2, ...)',
          'Condition for Minima / Destructive interference: Δ = (2n + 1)λ / 2',
          'Characteristic Impedance / Parameter Equation: Z_0 = √(L / C)',
        ],
      });
    } else if (i === 2) {
      pages.push({
        pageNumber: 2,
        sectionTitle: '2. Mathematical Formulation & Step-by-Step Derivations',
        paragraphs: [
          'Consider an arbitrary differential volume element undergoing transformation within the boundary constraints of the system.',
          'By applying the conservation laws and boundary condition limits at the interface, the differential form yields standard harmonic solution sets.',
          'The resulting equations provide explicit relationships between input excitation and steady-state response.',
        ],
        keyFormulas: [
          'ψ(x) = A sin(kx) + B cos(kx) with boundary values ψ(0) = 0 and ψ(L) = 0',
          'En = (n² h²) / (8 m L²) for quantized energy eigenvalues in a 1D potential well',
          'Power Factor: cos(θ) = R / |Z| = P_real / S_apparent',
        ],
        workedExample: {
          problem: `Example 2.1: Determine the fundamental parameters for a standard scenario given typical test values in ${subject?.code || 'Core Syllabus'}.`,
          solution: [
            'Step 1: Write down the given parameters and verify metric units (SI format).',
            'Step 2: Substitute into the characteristic transfer relationship.',
            'Step 3: Solve for the primary variable and confirm dimensional homogeneity.',
            'Conclusion: The calculated value aligns with nominal laboratory observations (Error < 1.2%).',
          ],
        },
      });
    } else if (i === totalPages) {
      pages.push({
        pageNumber: i,
        sectionTitle: `${i}. Summary, University Questions & Self-Assessment`,
        paragraphs: [
          'Key takeaways from this unit must be revised alongside previous year examination papers to ensure thorough preparation for the final semester examination.',
          'Review the solved numericals and ensure clarity on standard assumptions before sitting for internal assessments.',
        ],
        keyPoints: [
          'Review Part-A short answer definitions and unit statements (2 Marks each).',
          'Practice drawing all required circuit/optical schematics with proper labels.',
          'Consult the department question bank for further practice problems.',
        ],
        workedExample: {
          problem: 'Model Examination Question: Explain the working principle and derive the primary expression with a neat diagram [10 Marks].',
          solution: [
            '1. State the fundamental law and definition (2 Marks).',
            '2. Draw the schematic layout with clear labels (3 Marks).',
            '3. Write the mathematical derivation steps with boundary conditions (4 Marks).',
            '4. Highlight applications and concluding remarks (1 Mark).',
          ],
        },
      });
    } else {
      pages.push({
        pageNumber: i,
        sectionTitle: `${i}. Analytical Properties, Curves & Practical Significance`,
        paragraphs: [
          `Detailed examination of behavioral characteristics for ${resource.name.replace('.pdf', '')} across different operating regions.`,
          'Experimental observations confirm that the theoretical predictions match physical measurements within acceptable tolerance bounds.',
          'Special considerations regarding temperature variations, frequency response, and transient damping are outlined below.',
        ],
        keyPoints: [
          'Linear response region is maintained under standard laboratory excitation levels.',
          'Transient effects decay exponentially with characteristic time constant τ = RC (or L/R).',
          'Frequency response rolloff matches standard theoretical slope of -20 dB/decade.',
        ],
        keyFormulas: [
          'H(jω) = K / (1 + jω / ω_c)',
          'Total Harmonic Distortion (THD) = √(Σ V_n²) / V_1',
        ],
      });
    }
  }

  return {
    institution: 'MUFFAKHAM JAH COLLEGE OF ENGINEERING & TECHNOLOGY',
    course: 'B.E. Degree Academic Resource Repository',
    subjectTitle: subject ? `${subject.code ? `[${subject.code}] ` : ''}${subject.name}` : 'MJCET Academic Subject',
    unitTitle: folder?.name || 'Academic Course Material',
    documentTitle: resource.name.replace('.pdf', ''),
    author: resource.authorOrProfessor || 'MJCET Academic Faculty',
    academicYear: resource.academicYear || '2024–2025',
    totalPages,
    pages,
  };
}

/**
 * Creates a downloadable PDF file Blob with valid header structure
 * so student clicking "Download" receives a valid, recognizable PDF.
 */
export function triggerPdfDownload(resource: Resource): void {
  // Generate a minimal valid PDF-1.4 file buffer
  const title = resource.name.replace('.pdf', '');
  const pdfString = `%PDF-1.4
1 0 obj
<< /Title (${title.replace(/[\(\)]/g, '')})
   /Author (${(resource.authorOrProfessor || 'StudyZone MJCET').replace(/[\(\)]/g, '')})
   /Subject (MJCET Academic Material)
   /Creator (StudyZone MJCET - Academic Library)
>>
endobj
2 0 obj
<< /Type /Catalog
   /Pages 3 0 R
>>
endobj
3 0 obj
<< /Type /Pages
   /Kids [4 0 R]
   /Count 1
>>
endobj
4 0 obj
<< /Type /Page
   /Parent 3 0 R
   /MediaBox [0 0 595.28 841.89]
   /Contents 5 0 R
   /Resources << /Font << /F1 6 0 R >> >>
>>
endobj
5 0 obj
<< /Length 340 >>
stream
BT
/F1 18 Tf
50 780 Td
(MUFFAKHAM JAH COLLEGE OF ENGINEERING & TECHNOLOGY) Tj
/F1 12 Tf
0 -30 Td
(StudyZone Academic Resource Repository) Tj
/F1 14 Tf
0 -40 Td
(Resource: ${title.substring(0, 45).replace(/[\(\)]/g, '')}) Tj
/F1 10 Tf
0 -25 Td
(Author: ${(resource.authorOrProfessor || 'Department Faculty').replace(/[\(\)]/g, '')}) Tj
0 -20 Td
(Year: ${(resource.academicYear || '2024-2025').replace(/[\(\)]/g, '')}) Tj
0 -30 Td
(This official academic document was downloaded from StudyZone MJCET.) Tj
0 -20 Td
(For online preview, visit StudyZone MJCET.) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /Helvetica
>>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000150 00000 n 
0000000201 00000 n 
0000000262 00000 n 
0000000388 00000 n 
0000000780 00000 n 
trailer
<< /Size 7
   /Root 2 0 R
   /Info 1 0 R
>>
startxref
860
%%EOF`;

  const blob = new Blob([pdfString], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = resource.name.endsWith('.pdf') ? resource.name : `${resource.name}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
