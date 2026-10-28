const categoryDefaults = {
  "Digital Services": {
    icon: "01",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=82",
    alt: "Professional workspace with website development code on a computer",
    features: ["Clear scope and deliverables", "Professional digital setup", "Responsive client support"],
    benefits: ["Stronger online presence", "More efficient operations", "A polished customer experience"],
    suitable: "Businesses, founders, organisations and professionals building or improving their digital presence."
  },
  "Business & Documentation": {
    icon: "02",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82",
    alt: "Business professional reviewing organised documents at a desk",
    features: ["Structured content development", "Professional formatting", "Editable and presentation-ready files"],
    benefits: ["Clearer business communication", "Greater credibility", "Faster submission and decision-making"],
    suitable: "Startups, SMEs, teams, consultants and individuals preparing important business documents."
  },
  "Government & Online Applications": {
    icon: "03",
    image: "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1200&q=82",
    alt: "People receiving professional assistance with an online application",
    features: ["Requirements checklist", "Step-by-step online guidance", "Document readiness review"],
    benefits: ["Fewer avoidable errors", "Better application readiness", "Clearer next steps"],
    suitable: "Kenyan residents who need lawful guidance navigating official online systems and applications."
  },
  "Career & Professional": {
    icon: "04",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=82",
    alt: "Professionals collaborating on career documents and applications",
    features: ["Role-focused content", "Professional presentation", "Application quality review"],
    benefits: ["A stronger first impression", "Clearer professional positioning", "More confident applications"],
    suitable: "Students, graduates, career changers, professionals and executives pursuing new opportunities."
  },
  "Architecture & 3D Design": {
    icon: "05",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=82",
    alt: "Modern residential architecture with a premium exterior design",
    features: ["Client-led design brief", "Scaled plans or visual concepts", "Review and refinement stages"],
    benefits: ["Clearer project direction", "Better spatial decisions", "Professional construction communication"],
    suitable: "Homeowners, property developers, contractors and businesses planning built spaces."
  },
  "Education & Student Support": {
    icon: "06",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=82",
    alt: "University students working together on academic and application documents",
    features: ["Ethical guidance and formatting", "Structured review", "Submission-readiness support"],
    benefits: ["Better organised work", "Improved clarity", "Reduced application stress"],
    suitable: "Students and applicants who need ethical support with formatting, analysis and applications."
  },
  "Other Digital Support": {
    icon: "07",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=82",
    alt: "Data dashboard and digital productivity tools on a laptop",
    features: ["Flexible task-based support", "Secure file handling", "Clear output format"],
    benefits: ["Time saved", "Accurate digital outputs", "Flexible extra capacity"],
    suitable: "Busy individuals, remote teams and businesses that need reliable digital execution support."
  }
};

const catalog = {
  "Digital Services": [
    ["Website Development", "Fast, responsive business websites designed around clear customer journeys."],
    ["Website Redesign", "Modernise an outdated website with stronger structure, messaging and mobile usability."],
    ["Website Maintenance", "Ongoing content, security, performance and technical support for existing websites."],
    ["Domain & Hosting Assistance", "Practical help choosing, connecting and managing domains and website hosting."],
    ["Business Email Setup", "Professional branded email setup for teams and business owners."],
    ["Google Business Profile Assistance", "Set up or improve business information for stronger local discovery."],
    ["SEO & Search Console Assistance", "Improve search foundations, indexing visibility and website discoverability."],
    ["Digital Marketing", "Plan and coordinate practical campaigns that support awareness, leads and growth."],
    ["Social Media Management", "Consistent planning, publishing and performance support for social channels."],
    ["Social Media Content Creation", "On-brand posts, captions and campaign content designed for engagement."],
    ["Graphic Design", "Professional digital and print visuals for business communication and campaigns."],
    ["Posters & Promotional Designs", "High-impact promotional artwork for offers, events and announcements."],
    ["Branding & Business Identity", "Build a coherent visual direction that makes a business easier to recognise."],
    ["Logo Design", "Distinctive logo concepts and practical brand-ready file formats."],
    ["Digital Product Setup", "Structure and launch digital products, downloads, resources or service offers."]
  ],
  "Business & Documentation": [
    ["Business Plan Development", "Develop a structured plan for operations, growth, financing or launch decisions."],
    ["Company Profile Development", "Present business capability, services and credibility in a polished company profile."],
    ["Business Proposals", "Create persuasive proposals for clients, partners, projects and opportunities."],
    ["Investor Pitch Decks", "Turn a business opportunity into a concise, credible investor presentation."],
    ["Business Presentations", "Design clear presentations for meetings, training, sales and stakeholder communication."],
    ["Professional Document Formatting", "Transform draft content into clean, consistent and professional documents."],
    ["PDF Editing & Conversion", "Edit, organise, merge, convert or prepare PDF documents for professional use."],
    ["Data Entry", "Accurate transfer, cleanup and organisation of business information."],
    ["Research Assistance", "Focused research support with organised findings and clear source notes."],
    ["Data Analysis", "Turn spreadsheets and raw records into useful summaries and insights."],
    ["Report Preparation", "Structure findings and updates into decision-ready professional reports."]
  ],
  "Government & Online Applications": [
    ["KRA PIN Registration & Updates", "Guidance with KRA PIN registration details and account information updates."],
    ["KRA Returns Filing Assistance", "Administrative guidance for preparing and submitting applicable KRA returns."],
    ["KRA Penalty & Return Assistance", "Help understanding outstanding return or penalty steps and required follow-up."],
    ["HELB / HEF Application Assistance", "Application guidance, document checks and online process support."],
    ["KUCCPS Assistance", "Support navigating programme choices, applications and online KUCCPS steps."],
    ["SHA Registration Assistance", "Lawful guidance with health registration requirements and online steps."],
    ["NSSF Assistance", "Guidance with relevant NSSF registration or account processes."],
    ["Passport Application Assistance", "Help preparing requirements and navigating the official passport application process."],
    ["Good Conduct Application Guidance", "Requirements and online process guidance for certificate applications."],
    ["Insurance Application Assistance", "Support organising information and completing insurer application steps."],
    ["Online Government Service Guidance", "Practical support navigating eligible official digital services without misrepresentation."],
    ["Visa Application Assistance", "Organise visa requirements, supporting documents and application readiness without approval guarantees."],
    ["Travel Consultation", "Practical guidance with travel documentation, requirements and planning timelines."],
    ["Insurance Guidance", "Understand policy information, compare requirements and organise insurer documentation."],
    ["Claims Assistance", "Organise claim documents, check requirements and plan follow-up with the relevant insurer."]
  ],
  "Career & Professional": [
    ["CV Writing", "Create a focused, modern CV that communicates experience and measurable value."],
    ["Resume Development", "Develop a concise, opportunity-specific resume for local or international roles."],
    ["Cover Letters", "Write tailored cover letters that connect your strengths to the opportunity."],
    ["LinkedIn Profile Assistance", "Improve profile structure, positioning, keywords and professional presentation."],
    ["Job Application Assistance", "Organise and strengthen complete job application packages."],
    ["Online Job Application Assistance", "Navigate online forms, document uploads and application requirements."],
    ["Professional Document Preparation", "Prepare polished professional statements, bios and supporting documents."],
    ["Career Guidance", "Clarify career goals, application strategy and a practical professional-development action plan."]
  ],
  "Architecture & 3D Design": [
    ["Architectural Floor Plans", "Develop functional floor layouts based on site, room and lifestyle requirements."],
    ["House Plans", "Create residential plans for new homes, rentals, extensions and property investments."],
    ["Architectural Design", "Translate a project brief into coherent spatial and visual design direction."],
    ["3D Building Modelling", "Build three-dimensional models that communicate massing, form and design intent."],
    ["3D Rendering", "Produce realistic visual outputs for presentations and design decision-making."],
    ["Interior Visualization", "Explore materials, layouts, lighting and atmosphere before implementation."],
    ["Exterior Visualization", "Present building façades, finishes and surrounding context clearly."],
    ["Building Concept Designs", "Develop early design concepts for feasibility and stakeholder discussion."],
    ["Construction Documentation", "Prepare organised drawing information that supports project coordination."],
    ["Architectural Drawings", "Technical floor plans, elevations, sections and drawing coordination for design review."],
    ["2D Designs", "Clean scaled two-dimensional layouts for property, furniture and presentation needs."],
    ["Interior Design", "Develop interior layouts, finish palettes and visual concepts for homes and workspaces."]
  ],
  "Education & Student Support": [
    ["Research Writing Assistance", "Ethical coaching, structure and editing support without impersonation or academic misconduct."],
    ["Academic Formatting", "Apply consistent citations, headings, layout and institutional formatting requirements."],
    ["Proposal Formatting", "Organise research proposals into clear, compliant and readable documents."],
    ["Project & Report Formatting", "Polish student projects and reports for clear professional submission."],
    ["Data Analysis Assistance", "Support students in understanding and presenting quantitative or qualitative results."],
    ["Career Application Assistance", "Prepare documents for internships, graduate programmes and early-career opportunities."],
    ["Study-Abroad Application Assistance", "Coordinate requirements, statements and application readiness for overseas study."],
    ["University Applications", "Organise programme requirements, application documents and university submission timelines."],
    ["Scholarship Applications", "Review eligibility, organise supporting documents and prepare authentic scholarship applications."]
  ],
  "Other Digital Support": [
    ["Voice-Over Services", "Record clear voice content for presentations, campaigns and digital media."],
    ["Transcription", "Convert audio or video recordings into organised written documents."],
    ["Typing Services", "Accurately convert handwritten, scanned or rough content into editable files."],
    ["Blogging & Content Writing", "Create useful, brand-aligned articles and website content."],
    ["Virtual Assistant Services", "Flexible remote support for research, coordination and recurring admin tasks."],
    ["Database Assistance", "Help organise, clean and maintain structured business information."],
    ["Excel Services", "Build, clean and improve spreadsheets, formulas, trackers and summaries."],
    ["Google Workspace Assistance", "Set up and organise Docs, Sheets, Drive, Forms and collaboration workflows."],
    ["Canva Design Services", "Create editable branded templates and campaign-ready visual content."]
  ]
};

export const serviceCategories = Object.entries(catalog).map(([name, entries]) => ({
  name,
  ...categoryDefaults[name],
  count: entries.length
}));

export const services = Object.entries(catalog).flatMap(([category, entries]) => {
  const defaults = categoryDefaults[category];
  return entries.map(([title, description], index) => ({
    id: `${defaults.icon}-${String(index + 1).padStart(2, "0")}`,
    title,
    category,
    description,
    fullDescription: `${description} Every engagement begins with a clear brief, requirements review and agreed next steps.`,
    features: defaults.features,
    benefits: defaults.benefits,
    suitableCustomer: defaults.suitable,
    turnaround: "Confirmed after requirements review",
    pricing: "Custom quote",
    image: defaults.image,
    imageAlt: defaults.alt
  }));
});
