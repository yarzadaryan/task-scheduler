import { CalculationMethod, Coordinates, Madhab, PrayerTimes, CalculationParameters } from 'adhan'

export interface DailyPrayersMs {
  fajr: number
  dhuhr: number
  asr: number
  maghrib: number
  isha: number
}

export function getSterlingVaCoordinates() {
  // Sterling, Virginia
  return new Coordinates(39.006, -77.428)
}

export type MethodKey = 'NorthAmerica' | 'MuslimWorldLeague' | 'UmmAlQura' | 'Egyptian' | 'Karachi' | 'Dubai' | 'Qatar' | 'MoonsightingCommittee' | 'Kuwait' | 'Singapore' | 'Turkey' | 'Tehran'
export type MadhabKey = 'Shafi' | 'Hanafi'

export function buildParams(method: MethodKey, madhab: MadhabKey): CalculationParameters {
  let params: CalculationParameters
  switch (method) {
    case 'MuslimWorldLeague': params = CalculationMethod.MuslimWorldLeague(); break
    case 'UmmAlQura': params = CalculationMethod.UmmAlQura(); break
    case 'Egyptian': params = CalculationMethod.Egyptian(); break
    case 'Karachi': params = CalculationMethod.Karachi(); break
    case 'Dubai': params = CalculationMethod.Dubai(); break
    case 'Qatar': params = CalculationMethod.Qatar(); break
    case 'MoonsightingCommittee': params = CalculationMethod.MoonsightingCommittee(); break
    case 'Kuwait': params = CalculationMethod.Kuwait(); break
    case 'Singapore': params = CalculationMethod.Singapore(); break
    case 'Turkey': params = CalculationMethod.Turkey(); break
    case 'Tehran': params = CalculationMethod.Tehran(); break
    case 'NorthAmerica':
    default: params = CalculationMethod.NorthAmerica(); break
  }
  params.madhab = madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi
  return params
}

export function getTodaysPrayerTimesMs(method: MethodKey = 'NorthAmerica', madhab: MadhabKey = 'Shafi', timezone: string = 'America/New_York'): DailyPrayersMs {
  const coords = getSterlingVaCoordinates()
  const today = new Date()
  const params = buildParams(method, madhab)

  const pt = new PrayerTimes(coords, today, params)

  // Helper to convert Date to epoch ms considering the intended timezone.
  // Dates from adhan are JS Date objects in local tz; ensure alignment by rebuilding
  // with the same wall clock time in provided timezone via Intl if needed.
  function toMs(d: Date): number {
    return d.getTime()
  }

  return {
    fajr: toMs(pt.fajr),
    dhuhr: toMs(pt.dhuhr),
    asr: toMs(pt.asr),
    maghrib: toMs(pt.maghrib),
    isha: toMs(pt.isha),
  }
}
