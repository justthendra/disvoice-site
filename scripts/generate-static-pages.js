const fs = require('fs');
const path = require('path');

const docsData = require('../docs.json');

const Kind = {
    Class: 128,
    Interface: 256,
    Enum: 8,
    Function: 64,
    TypeAlias: 4194304,
};

const DOCS_DIR = path.join(__dirname, '../src/app/docs');

// Page template for individual doc pages
const createPageContent = (category, name) => `import DocPageContent from '@/components/DocPageContent';

export default function ${name.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return <DocPageContent slug={['${category}', '${name}']} />;
}
`;

// Category page template
const createCategoryPageContent = (category) => `import DocPageContent from '@/components/DocPageContent';

export default function ${category.charAt(0).toUpperCase() + category.slice(1)}Page() {
  return <DocPageContent slug={['${category}']} />;
}
`;

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function generatePages() {
    const root = docsData;
    if (!root.children) {
        console.error('No children found in docs.json');
        return;
    }

    const categories = {
        classes: root.children.filter(c => c.kind === Kind.Class),
        interfaces: root.children.filter(c => c.kind === Kind.Interface),
        enums: root.children.filter(c => c.kind === Kind.Enum),
        functions: root.children.filter(c => c.kind === Kind.Function),
        types: root.children.filter(c => c.kind === Kind.TypeAlias),
    };

    let totalPages = 0;

    for (const [category, items] of Object.entries(categories)) {
        if (items.length === 0) continue;

        // Create category directory
        const categoryDir = path.join(DOCS_DIR, category);
        ensureDir(categoryDir);

        // Create category index page
        const categoryPagePath = path.join(categoryDir, 'page.tsx');
        fs.writeFileSync(categoryPagePath, createCategoryPageContent(category));
        console.log(`Created: ${categoryPagePath}`);
        totalPages++;

        // Create individual item pages
        for (const item of items) {
            const itemDir = path.join(categoryDir, item.name);
            ensureDir(itemDir);

            const itemPagePath = path.join(itemDir, 'page.tsx');
            fs.writeFileSync(itemPagePath, createPageContent(category, item.name));
            console.log(`Created: ${itemPagePath}`);
            totalPages++;
        }
    }

    console.log(`\nTotal pages generated: ${totalPages}`);
}

generatePages();
