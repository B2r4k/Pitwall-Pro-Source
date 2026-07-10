export interface Track {
  id: string;
  name: string;
  laps: number;
  distance: number; // km
  fuelSeverity: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  wearSeverity: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  pitTimeBase: number; // seconds (entering/exiting pitlane)
}

export type TyreCompound = 'XS' | 'S' | 'M' | 'H' | 'Rain';

export interface Weather {
  tempBase: number;
  tempMax: number;
  humidity?: number; // 0-100
  rainProps: {
    q1: number;
    q2_r1: number; // 0-30m
    r2: number; // 30m-1h
    r3: number; // 1h-1.5h
    r4: number; // 1.5h-2h
  };
}

export interface CarParts {
  chassis: number;
  engine: number;
  frontWing: number;
  rearWing: number;
  underbody: number;
  sidepods: number;
  cooling: number;
  gearbox: number;
  brakes: number;
  suspension: number;
  electronics: number;
}

export type League = 'Rookie' | 'Amateur' | 'Pro' | 'Master' | 'Elite';

export interface PlayerStats {
  name?: string;
  baseFuelPerLap: number; // Configurable by user depending on their car
  baseWearMultiplier: number; // Configurable by user depending on driver/car
  riskAggression: number; // 0 to 100
  risks?: {
    clear: number;
    defend: number;
    overtake: number;
    malfunction: number;
  };
  totalRacers?: number;
  pha?: { power: number; handling: number; acceleration: number; };
  driverFocus: number; // Concentration (0-250)
  driverStamina: number; // Stamina (0-250)
  driverExperience: number; // Experience (0-250)
  tyreSupplier: string; // 'Pipirelli', 'Dunnolop', etc.
  league?: League;
  carParts?: CarParts;
  carPower?: number;
  carHandling?: number;
  carAcceleration?: number;
  startPosition?: number;
  testingData?: any;
}

export interface Stint {
  laps: number;
  tyres: TyreCompound;
  fuelStart: number;
  fuelNeeded: number;
  wearEnd: number;
  conditionsPenalty?: number;
}

export interface StrategyResult {
  stops: number;
  totalRaceTime: number; // Estimated seconds (relative)
  stints: Stint[];
}
