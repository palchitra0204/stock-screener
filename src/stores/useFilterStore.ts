import { create } from 'zustand';
import { FilterGroup, FilterRule, PresetScreen } from '@/types/filter';
import { PRESET_SCREENS } from '@/lib/constants';
import { storage } from '@/lib/storage';

interface FilterStoreState {
  filterGroup: FilterGroup;
  searchQuery: string;
  selectedSectors: string[];
  selectedMcap: string[];
  activePresetId: string | null;
  customPresets: PresetScreen[];

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedSectors: (sectors: string[]) => void;
  toggleSector: (sector: string) => void;
  setSelectedMcap: (mcap: string[]) => void;
  toggleMcap: (mcap: string) => void;
  setCombinator: (combinator: 'AND' | 'OR') => void;
  addRule: (rule?: Partial<FilterRule>) => void;
  updateRule: (ruleId: string, updates: Partial<FilterRule>) => void;
  removeRule: (ruleId: string) => void;
  toggleRule: (ruleId: string) => void;
  applyPreset: (preset: PresetScreen) => void;
  saveCustomPreset: (name: string, description: string) => void;
  deleteCustomPreset: (id: string) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTER_GROUP: FilterGroup = {
  id: 'root-group',
  combinator: 'AND',
  enabled: true,
  rules: [],
};

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  filterGroup: DEFAULT_FILTER_GROUP,
  searchQuery: '',
  selectedSectors: [],
  selectedMcap: [],
  activePresetId: null,
  customPresets: [],

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSelectedSectors: (selectedSectors) => set({ selectedSectors }),

  toggleSector: (sector) => {
    const current = get().selectedSectors;
    if (current.includes(sector)) {
      set({ selectedSectors: current.filter((s) => s !== sector) });
    } else {
      set({ selectedSectors: [...current, sector] });
    }
  },

  setSelectedMcap: (selectedMcap) => set({ selectedMcap }),

  toggleMcap: (mcap) => {
    const current = get().selectedMcap;
    if (current.includes(mcap)) {
      set({ selectedMcap: current.filter((m) => m !== mcap) });
    } else {
      set({ selectedMcap: [...current, mcap] });
    }
  },

  setCombinator: (combinator) => {
    set({
      filterGroup: {
        ...get().filterGroup,
        combinator,
      },
      activePresetId: null,
    });
  },

  addRule: (rule) => {
    const newRule: FilterRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      field: rule?.field || 'marketCap',
      operator: rule?.operator || 'gte',
      value: rule?.value !== undefined ? rule.value : 500,
      enabled: true,
      ...rule,
    };

    set({
      filterGroup: {
        ...get().filterGroup,
        rules: [...get().filterGroup.rules, newRule],
      },
      activePresetId: null,
    });
  },

  updateRule: (ruleId, updates) => {
    const updatedRules = get().filterGroup.rules.map((r) => {
      if ('id' in r && r.id === ruleId) {
        return { ...r, ...updates };
      }
      return r;
    });

    set({
      filterGroup: {
        ...get().filterGroup,
        rules: updatedRules,
      },
      activePresetId: null,
    });
  },

  removeRule: (ruleId) => {
    const filtered = get().filterGroup.rules.filter((r) => !('id' in r && r.id === ruleId));
    set({
      filterGroup: {
        ...get().filterGroup,
        rules: filtered,
      },
      activePresetId: null,
    });
  },

  toggleRule: (ruleId) => {
    const updated = get().filterGroup.rules.map((r) => {
      if ('id' in r && r.id === ruleId) {
        return { ...r, enabled: !r.enabled };
      }
      return r;
    });

    set({
      filterGroup: {
        ...get().filterGroup,
        rules: updated,
      },
    });
  },

  applyPreset: (preset) => {
    set({
      filterGroup: JSON.parse(JSON.stringify(preset.filterGroup)),
      activePresetId: preset.id,
    });
  },

  saveCustomPreset: (name, description) => {
    const newPreset: PresetScreen = {
      id: `custom-${Date.now()}`,
      name,
      description,
      filterGroup: JSON.parse(JSON.stringify(get().filterGroup)),
      badge: 'Custom',
      isCustom: true,
    };

    const updated = [...get().customPresets, newPreset];
    storage.saveCustomPresets(updated);
    set({ customPresets: updated, activePresetId: newPreset.id });
  },

  deleteCustomPreset: (id) => {
    const updated = get().customPresets.filter((p) => p.id !== id);
    storage.saveCustomPresets(updated);
    set({
      customPresets: updated,
      activePresetId: get().activePresetId === id ? null : get().activePresetId,
    });
  },

  resetFilters: () => {
    set({
      filterGroup: {
        id: 'root-group',
        combinator: 'AND',
        enabled: true,
        rules: [],
      },
      searchQuery: '',
      selectedSectors: [],
      selectedMcap: [],
      activePresetId: null,
    });
  },
}));
