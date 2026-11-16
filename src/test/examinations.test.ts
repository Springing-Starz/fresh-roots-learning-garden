import { describe, expect, it } from 'vitest';
import manifest from '@/data/catalog/repositories.json';
import { EXAMS_REPOS, examsHrefForClass } from '@/data/more-documents';
import { loadRepositoryDocuments } from '@/lib/repository-catalog';
import { loadDocument } from '@/lib/document-catalog';
import { documentSlug } from '@/lib/document-metadata';
import { documentViewer } from '@/lib/document-viewer';
import { documentExtension } from '@/lib/document-formats';
import type { ClassHubData } from '@/lib/class-hubs';
import baby from '@/data/class-hubs/baby.html.json';
import p4 from '@/data/class-hubs/p4.html.json';
import p7 from '@/data/class-hubs/p7.html.json';

const babyHub = baby as ClassHubData;
const p4Hub = p4 as ClassHubData;
const p7Hub = p7 as ClassHubData;

type RepoEntry = { label: string; data: string; count: number; commit: string };
const repos = manifest.repositories as unknown as Record<string, RepoEntry>;

const examinations = (hub: ClassHubData) => hub.menus.find(menu => menu.label === 'EXAMINATIONS');
const hrefsOf = (hub: ClassHubData) => (examinations(hub)?.items ?? []).flatMap(item => 'href' in item ? [item.href] : []);

describe('Class examinations pages', () => {
  it('opens each class exam page from its own Examinations button', () => {
    expect(examsHrefForClass('baby')).toBe('/more/exams-baby');
    expect(examsHrefForClass('p4')).toBe('/more/exams-p4');
    expect(examinations(babyHub)?.href).toBe('/more/exams-baby');
    expect(examinations(p4Hub)?.href).toBe('/more/exams-p4');
    expect(hrefsOf(p4Hub)).toEqual([]);
  });

  it('names each class ZIP All Examinations', async () => {
    const items = await loadRepositoryDocuments('exams-p4');
    expect(items[0]?.title).toBe('All Examinations');
  });

  it('lists every file format the collection holds, ZIP first', async () => {
    const items = await loadRepositoryDocuments('exams-p4');
    const formats = new Set(items.map(item => documentExtension(item.pdfUrl)));
    expect(repos['exams-p4']?.count).toBe(8);
    expect(items).toHaveLength(8);
    expect([...formats].sort()).toEqual(['docx', 'pdf', 'zip']);
    expect(items[0]?.pdfUrl).toMatch(/P4\.zip$/);
  });

  it('opens every listed exam file on its own page', async () => {
    const items = await loadRepositoryDocuments('exams-p4');
    for (const item of items) {
      const result = await loadDocument(documentSlug(item), 'more/exams-p4');
      expect(result?.item.pdfUrl).toBe(item.pdfUrl);
    }
  });

  it('previews papers and word files, and keeps the ZIP as a download', async () => {
    const items = await loadRepositoryDocuments('exams-p4');
    const papers = items.filter(item => ['pdf', 'docx'].includes(documentExtension(item.pdfUrl)));
    expect(papers.length).toBeGreaterThan(0);
    for (const item of papers) expect(documentViewer(item.pdfUrl).kind).not.toBe('unsupported');
    const archive = items.find(item => documentExtension(item.pdfUrl) === 'zip');
    expect(archive?.pdfUrl).toMatch(/\.zip$/);
  });

  it('keeps a class without exam files on its audited destinations', () => {
    expect(examsHrefForClass('p7')).toBeNull();
    expect(EXAMS_REPOS['p7']).toBeUndefined();
    expect(hrefsOf(p7Hub)[0]).not.toBe('/more/exams-p7');
    expect(hrefsOf(p7Hub)[0]).toMatch(/\.html$/);
  });
});
