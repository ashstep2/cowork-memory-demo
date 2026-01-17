import fs from 'fs';
import path from 'path';
import { Deal } from '../memory/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEMO_DIR = path.join(DATA_DIR, 'demo');
const USER_DIR = path.join(DATA_DIR, 'user');

/**
 * Loads deals from file system (both demo and user directories)
 * Server-side only (uses fs module)
 *
 * Priority: User files override demo files with same ID
 */
export function loadDealsFromFiles(): Deal[] {
  const deals: Deal[] = [];

  try {
    // Load user deals first (priority over demo)
    if (fs.existsSync(USER_DIR)) {
      const userDeals = loadFromDirectory(USER_DIR, false);
      deals.push(...userDeals);
    }

    // Load demo deals
    if (fs.existsSync(DEMO_DIR)) {
      const demoDeals = loadFromDirectory(DEMO_DIR, true);
      // Only add demo deals if ID doesn't exist in user deals
      const userIds = new Set(deals.map(d => d.id));
      const filteredDemoDeals = demoDeals.filter(d => !userIds.has(d.id));
      deals.push(...filteredDemoDeals);
    }

    console.log(`[Loader] Loaded ${deals.length} deals from file system`);
    return deals;
  } catch (error) {
    console.error('[Loader] Failed to load deals from files:', error);
    return [];
  }
}

function loadFromDirectory(dir: string, isDemo: boolean): Deal[] {
  const deals: Deal[] = [];

  try {
    const folders = fs.readdirSync(dir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_') && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name);

    for (const folder of folders) {
      const folderPath = path.join(dir, folder);
      const deal = loadDealFromFolder(folderPath, folder, isDemo);
      if (deal) {
        deals.push(deal);
      }
    }

    const sourceType = isDemo ? 'demo' : 'user';
    console.log(`[Loader] Loaded ${deals.length} deals from ${sourceType}`);
  } catch (error) {
    console.error(`[Loader] Failed to load from ${dir}:`, error);
  }

  return deals;
}

function loadDealFromFolder(folderPath: string, folderId: string, isDemo: boolean): Deal | null {
  try {
    // Required files
    const dealJsonPath = path.join(folderPath, 'deal.json');
    const pitchDeckPath = path.join(folderPath, 'pitch-deck.md');
    const financialsPath = path.join(folderPath, 'financials.md');

    // Check if required files exist
    if (!fs.existsSync(dealJsonPath)) {
      console.warn(`[Loader] Skipping ${folderId}: Missing deal.json`);
      return null;
    }

    if (!fs.existsSync(pitchDeckPath)) {
      console.warn(`[Loader] Skipping ${folderId}: Missing pitch-deck.md`);
      return null;
    }

    // Read files
    const dealData = JSON.parse(fs.readFileSync(dealJsonPath, 'utf-8'));
    const pitchDeck = fs.readFileSync(pitchDeckPath, 'utf-8');
    const financials = fs.existsSync(financialsPath)
      ? fs.readFileSync(financialsPath, 'utf-8')
      : '';

    // Construct Deal object
    const deal: Deal = {
      id: folderId,
      name: dealData.company || folderId,
      tagline: dealData.tagline || '',
      stage: dealData.stage || 'Unknown',
      sector: dealData.sector || 'Unknown',
      metrics: {
        arr: dealData.metrics?.arr || 0,
        mrr: dealData.metrics?.mrr || 0,
        growthMoM: dealData.metrics?.growthMoM || 0,
        burnMonthly: dealData.metrics?.burnMonthly || 0,
        runwayMonths: dealData.metrics?.runwayMonths || 0,
        customers: dealData.metrics?.customers || 0,
        topCustomerPct: dealData.metrics?.topCustomerPct || 0,
        grossMargin: dealData.metrics?.grossMargin || 0,
        nrr: dealData.metrics?.nrr || 0,
      },
      funding: {
        raising: dealData.funding?.raising || 0,
        preMoney: dealData.funding?.preMoney || 0,
        lead: dealData.funding?.lead || 'Unknown',
        existingInvestors: dealData.funding?.existingInvestors || [],
      },
      team: {
        ceo: dealData.team?.ceo || { name: 'Unknown', role: 'CEO', background: 'Unknown' },
        cto: dealData.team?.cto || { name: 'Unknown', role: 'CTO', background: 'Unknown' },
        employees: dealData.team?.employees || 0,
      },
      deckSummary: pitchDeck,
      financialsDetail: financials,
      _isDemo: isDemo,
    };

    console.log(`[Loader] Successfully loaded ${deal.name} from ${folderId}`);
    return deal;
  } catch (error) {
    console.error(`[Loader] Failed to load deal from ${folderId}:`, error);
    return null;
  }
}
