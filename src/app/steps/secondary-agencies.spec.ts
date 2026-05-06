import { SECONDARY_AGENCIES } from './secondary-agencies.config';

describe('Secondary Agencies Config', () => {
  it('has 9 agencies', () => {
    expect(SECONDARY_AGENCIES.length).toBe(9);
  });

  it('all agencies have required fields', () => {
    for (const agency of SECONDARY_AGENCIES) {
      expect(agency.key).toBeTruthy();
      expect(agency.name).toBeTruthy();
      expect(agency.method).toMatch(/^(online|mail|phone)$/);
      expect(agency.instructions).toBeTruthy();
    }
  });

  it('completion percentage calculation', () => {
    const checked: Record<string, boolean> = {};
    SECONDARY_AGENCIES.forEach((a, i) => { if (i < 5) checked[a.key] = true; });
    const count = Object.values(checked).filter(Boolean).length;
    const pct = (count / SECONDARY_AGENCIES.length) * 100;
    expect(pct).toBeCloseTo(55.6, 0);
  });

  it('all complete when all checked', () => {
    const checked: Record<string, boolean> = {};
    SECONDARY_AGENCIES.forEach(a => { checked[a.key] = true; });
    const allDone = Object.values(checked).every(Boolean) && Object.keys(checked).length === SECONDARY_AGENCIES.length;
    expect(allDone).toBeTrue();
  });
});
