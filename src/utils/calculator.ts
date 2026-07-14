import {
  Track,
  TyreCompound,
  Weather,
  PlayerStats,
  StrategyResult,
  Stint,
} from "../types";
import {
  COMPOUND_PACE,
  COMPOUND_WEAR_RATE,
  COMPOUND_IDEAL_TEMP,
  SEVERITY_MULTIPLIERS,
} from "../data";

export interface CalcParams {
  track: Track;
  weather: Weather;
  player: PlayerStats;
  // Specific multipliers for transparency
  weightPenaltyPerLiter: number; // e.g., +0.03 seconds per liter per lap
  pitRefuelRate: number; // liters per second
  driverWeight: number; // User's driver weight in kg
}

/**
 * Calculate expected wear per lap for a specific compound under current conditions
 */
export function calculateWearPerLap(
  compound: TyreCompound,
  params: CalcParams,
  rainProb: number = 0,
): number {
  const baseRate = COMPOUND_WEAR_RATE[compound];
  const trackMultiplier = SEVERITY_MULTIPLIERS[params.track.wearSeverity];
  const playerMultiplier = params.player.baseWearMultiplier || 1.0;

  // Temperature effect: If temperature is higher than compound ideal, wear increases
  const avgTemp = (params.weather.tempBase + params.weather.tempMax) / 2;
  let tempMultiplier = 1.0;
  const tempDiff = avgTemp - COMPOUND_IDEAL_TEMP[compound];

  let supplierWearMult = 1.0;
  const supp = params.player.tyreSupplier;
  if (supp === "Pipirelli") supplierWearMult = 1.05;
  else if (supp === "Avonn") supplierWearMult = 1.08;
  else if (supp === "Contimental") supplierWearMult = 1.0;
  else if (supp === "Dunnolop") supplierWearMult = 0.95;
  else if (supp === "Yokohama") supplierWearMult = 0.98;
  else if (supp === "Michelin") supplierWearMult = 0.92;
  else if (supp === "Bridgestone") supplierWearMult = 0.94;
  else if (supp === "Hancock") supplierWearMult = 1.02;

  if (compound !== "Rain") {
    if (tempDiff > 0) {
      tempMultiplier += tempDiff * 0.025; // Overheating heavily hurts tyres in GPRO
    } else if (tempDiff < 0) {
      tempMultiplier += tempDiff * 0.008; // Cold tyres get slight wear but mainly pace penalty
    }
  }

  // Rain impact on wear
  let rainWearMultiplier = 1.0;
  if (compound === "Rain") {
    if (rainProb < 10)
      rainWearMultiplier = 4.5; // Destroyed on dry
    else if (rainProb < 30) rainWearMultiplier = 2.5;
    else if (rainProb < 50) rainWearMultiplier = 1.5;
    else rainWearMultiplier = 0.8; // Actually wears LESS when full wet track due to cooling
  } else {
    // Dry tyres in rain
    if (rainProb > 50) rainWearMultiplier = 1.8;
    else if (rainProb > 20) rainWearMultiplier = 1.3;
  }

  tempMultiplier = Math.max(0.7, tempMultiplier);

  // Aggression adds heavily to wear in GPRO
  const aggressionMultiplier = 1.0 + params.player.riskAggression * 0.002; // 50 CT = +10% wear

  // Driver stats modifiers
  // Experience reduces wear, Concentration reduces lockups, Stamina keeps it clean
  const concentrationPenalty =
    Math.max(0, 250 - params.player.driverFocus) * 0.0001;
  const staminaPenalty =
    Math.max(0, 250 - params.player.driverStamina) * 0.0002;
  const expBonus = params.player.driverExperience * 0.0001; // Up to -2.5% wear

  // Weight penalty to wear (heavier car = more wear)
  const baseWeight = 80;
  let weightWearMultiplier = 1.0;
  if (params.driverWeight) {
    const wDiff = params.driverWeight - baseWeight;
    weightWearMultiplier += wDiff * 0.001;
  }

  const driverStatsMultiplier =
    (1.0 + concentrationPenalty + staminaPenalty - expBonus) *
    weightWearMultiplier;

  // Car parts impact on wear
  let partsWearMultiplier = 1.0;
  if (
    params.player.pha &&
    (params.player.pha.handling > 0 ||
      params.player.pha.power > 0 ||
      params.player.pha.acceleration > 0)
  ) {
    const pha = params.player.pha;
    const handlingBonus = pha.handling * 0.004; // High handling = less wear
    const accPowerCost = (pha.power + pha.acceleration) * 0.001; // Power brings more wear
    partsWearMultiplier -= handlingBonus;
    partsWearMultiplier += accPowerCost;
  } else if (params.player.carParts) {
    const p = params.player.carParts;
    // Chassis & Suspension heavily reduce wear
    const chassisBonus = (p.chassis - 1) * 0.012;
    const suspensionBonus = (p.suspension - 1) * 0.015;
    // Downforce levels can increase load, thus increasing wear slightly, while power (engine/brakes) forces wear
    const aeroBrakesCost =
      ((p.frontWing + p.rearWing + p.brakes) / 3 - 1) * 0.004;
    partsWearMultiplier -= chassisBonus + suspensionBonus;
    partsWearMultiplier += aeroBrakesCost;
  }

  const globalGproWearCalibrator = 1.55;

  return (
    baseRate *
    trackMultiplier *
    playerMultiplier *
    tempMultiplier *
    aggressionMultiplier *
    driverStatsMultiplier *
    rainWearMultiplier *
    supplierWearMult *
    partsWearMultiplier *
    globalGproWearCalibrator
  );
}

/**
 * Fuel consumed per lap
 */
export function calculateFuelPerLap(params: CalcParams): number {
  const trackMultiplier = SEVERITY_MULTIPLIERS[params.track.fuelSeverity];

  // Car parts impact on fuel
  let partsFuelMultiplier = 1.0;
  if (
    params.player.pha &&
    (params.player.pha.power > 0 || params.player.pha.acceleration > 0)
  ) {
    const pha = params.player.pha;
    const powerCost = pha.power * 0.003; // More power = more fuel
    const electronicsBonus = pha.handling * 0.001; // Better handling/electronics = less fuel wasted
    partsFuelMultiplier += powerCost - electronicsBonus;
  } else if (params.player.carParts) {
    const p = params.player.carParts;
    const engineCost = (p.engine - 1) * 0.015; // Engine Lv increases fuel consumption
    const electronicsBonus = (p.electronics - 1) * 0.012; // Electronics Lv decreases fuel consumption
    partsFuelMultiplier += engineCost - electronicsBonus;
  }

  // CT Risk adds a tiny bit to fuel consumption (pushing harder)
  const riskFuelCost = params.player.riskAggression * 0.0005;

  return (
    params.player.baseFuelPerLap *
    trackMultiplier *
    (partsFuelMultiplier + riskFuelCost)
  );
}

/**
 * Estimates the percentage wear incurred by the car parts after a full race
 */
export function calculateRaceCarWear(
  params: CalcParams,
): Record<keyof PlayerStats["carParts"], number> {
  // Aggression significantly increases car wear.
  // ~8-10% increase per 10 points for high wear parts.
  const riskMultiplier = 1.0 + params.player.riskAggression * 0.007;
  // Distance scaling (standard race ~300km)
  const distanceMultiplier = params.track.distance / 300.0;

  // Track severity impacts car parts wear slightly too
  const trackMultiplier =
    SEVERITY_MULTIPLIERS[params.track.wearSeverity] || 1.0;

  // Helper to cap precision
  const format = (val: number) =>
    parseFloat(
      (val * riskMultiplier * distanceMultiplier * trackMultiplier).toFixed(1),
    );

  return {
    chassis: format(12.5),
    engine: format(24.5),
    frontWing: format(10.5),
    rearWing: format(10.5),
    underbody: format(9.5),
    sidepods: format(9.0),
    cooling: format(14.0),
    gearbox: format(21.5),
    brakes: format(19.0),
    suspension: format(16.5),
    electronics: format(11.5),
  } as Record<keyof PlayerStats["carParts"], number>;
}

export function getStintRainProbability(
  startLap: number,
  endLap: number,
  totalLaps: number,
  rainProps: Weather["rainProps"],
): number {
  if (startLap >= endLap || totalLaps <= 0) return 0;
  let sum = 0;
  for (let lap = startLap; lap < endLap; lap++) {
    const fraction = lap / totalLaps;
    if (fraction < 0.25) sum += rainProps.q2_r1;
    else if (fraction < 0.5) sum += rainProps.r2;
    else if (fraction < 0.75) sum += rainProps.r3;
    else sum += rainProps.r4;
  }
  return sum / (endLap - startLap);
}

/**
 * Calculates a single stint duration and capabilities
 */
export function simulateStint(
  laps: number,
  compound: TyreCompound,
  params: CalcParams,
  startLap: number = 0,
): {
  valid: boolean;
  wearEnd: number;
  timeCost: number;
  fuelNeeded: number;
  conditionsPenalty: number;
} {
  const rainProb = getStintRainProbability(
    startLap,
    startLap + laps,
    params.track.laps,
    params.weather.rainProps,
  );

  const wearPerLap = calculateWearPerLap(compound, params, rainProb);
  const totalWear = wearPerLap * laps;

  const fuelPerLap = calculateFuelPerLap(params);
  const fuelNeeded = laps * fuelPerLap;

  // Calculate Pace base difference
  const pacePenalty = COMPOUND_PACE[compound] * laps;

  // Calculate Fuel weight penalty
  const avgFuelLiters = fuelNeeded / 2;
  const fuelWeightPenalty = avgFuelLiters * params.weightPenaltyPerLiter * laps;

  // Heat and Rain Pace Penalty
  const avgTemp = (params.weather.tempBase + params.weather.tempMax) / 2;
  const tempDiff = avgTemp - COMPOUND_IDEAL_TEMP[compound];
  let conditionsPacePenalty = 0;

  if (compound !== "Rain") {
    // Overheat penalty
    if (tempDiff > 5) {
      conditionsPacePenalty += (tempDiff - 5) * 0.1 * laps;
    }
    // Rain penalty for Dry tyres (massive)
    if (rainProb > 10) {
      conditionsPacePenalty += rainProb * 0.2 * laps; // e.g. 50% rain = +10s per lap
    }
    // Humidity penalty for Dry
    if (params.weather.humidity && params.weather.humidity > 60) {
      conditionsPacePenalty += (params.weather.humidity - 60) * 0.01 * laps;
    }
  } else {
    // Overheat penalty for Rain Tyres when it's just very hot even if raining. Rain tyres melt on hot tracks.
    if (avgTemp > 20) {
      conditionsPacePenalty += (avgTemp - 20) * 0.15 * laps;
    }
    // Dry penalty for Rain tyres (massive)
    if (rainProb < 50) {
      conditionsPacePenalty += (50 - rainProb) * 0.15 * laps; // e.g. 0% rain = +7.5s per lap
    }
  }

  const timeCost = pacePenalty + fuelWeightPenalty + conditionsPacePenalty;

  // Hard limits for validity
  const validWear = totalWear <= 95;
  const validFuel = fuelNeeded <= 180; // Fuel tank capacity limit

  return {
    valid: validWear && validFuel,
    wearEnd: totalWear,
    timeCost,
    fuelNeeded,
    conditionsPenalty: conditionsPacePenalty,
  };
}

/**
 * Helper to generate cartesian product
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce(
    (a, b) => a.flatMap((d) => b.map((e) => [d, e].flat() as T[])),
    [[]] as T[][],
  );
}

/**
 * Explores basic symmetrical strategies and mixed strategies.
 */
export function analyzeStrategies(params: CalcParams): StrategyResult[] {
  const results: StrategyResult[] = [];
  const maxStops = 4;
  const compounds: TyreCompound[] = ["XS", "S", "M", "H", "Rain"];

  for (let stops = 0; stops <= maxStops; stops++) {
    const numStints = stops + 1;
    // Base laps per stint
    const baseLaps = Math.floor(params.track.laps / numStints);
    const extraLaps = params.track.laps % numStints;

    // We can test all pure strategies + 1 dry 1 wet mixed strategies.
    // Instead of doing all 3125, let's explore pure combinations and basic dry/wet mixes.
    const stintLapsArray = Array.from(
      { length: numStints },
      (_, i) => baseLaps + (i < extraLaps ? 1 : 0),
    );

    // Instead of doing all 3125 combinations, generate strategies that use exactly one dry compound (and/or Rain).
    const dryCompounds: TyreCompound[] = ["XS", "S", "M", "H"];
    let allCombinations: TyreCompound[][] = [];

    for (const dry of dryCompounds) {
      const allowedCompounds: TyreCompound[] = [dry, "Rain"];
      const compoundArrays = Array.from(
        { length: numStints },
        () => allowedCompounds,
      );
      const combos = cartesianProduct(compoundArrays);
      allCombinations.push(...combos);
    }

    // Deduplicate (since pure Rain will be generated 4 times)
    const uniqueStrings = Array.from(
      new Set(allCombinations.map((c) => c.join("-"))),
    );
    const uniqueCombinations = uniqueStrings.map(
      (str) => str.split("-") as TyreCompound[],
    );

    for (const combo of uniqueCombinations) {
      let validStrategy = true;
      let totalRelativeTime = 0;
      const stints: Stint[] = [];
      let currentLap = 0;

      for (let i = 0; i < numStints; i++) {
        const stintLaps = stintLapsArray[i];
        const compound = combo[i];

        if (stintLaps <= 0) continue;

        const stintSim = simulateStint(stintLaps, compound, params, currentLap);

        if (!stintSim.valid) {
          validStrategy = false;
          break;
        }

        totalRelativeTime += stintSim.timeCost;

        stints.push({
          laps: stintLaps,
          tyres: compound,
          fuelStart: stintSim.fuelNeeded,
          fuelNeeded: stintSim.fuelNeeded,
          wearEnd: stintSim.wearEnd,
          conditionsPenalty: stintSim.conditionsPenalty,
        });

        currentLap += stintLaps;
      }

      if (validStrategy && stints.length === numStints) {
        // Add Pit Stop times
        let totalPitTime = 0;
        const startPos = params.player.startPosition || 1;
        // Traffic/Overtake penalty: extra stops drop you into traffic. If starting near front, this costs more relative time compared to clean air.
        // Approx 0 to 15 seconds penalty per stop depending on track position.
        const trafficPenaltyPerStop = Math.max(0, (40 - startPos) * 0.35);

        for (let i = 0; i < stops; i++) {
          const nextStintFuel = stints[i + 1].fuelStart;
          const pitTime =
            params.track.pitTimeBase +
            nextStintFuel / params.pitRefuelRate +
            trafficPenaltyPerStop;
          totalPitTime += pitTime;
        }

        totalRelativeTime += totalPitTime;

        results.push({
          stops,
          totalRaceTime: totalRelativeTime,
          stints,
        });
      }
    }
  }

  // Sort by Best Total Race Time
  const sorted = results.sort((a, b) => a.totalRaceTime - b.totalRaceTime);
  // Keep only the top 50 to avoid lagging the UI
  return sorted.slice(0, 50);
}

/**
 * Reverse calculate Base Fuel Per Lap from past stint data
 */
export function calculateBaseFuel(
  trackId: string,
  fuelConsumed: number,
  lapsCompleted: number,
  trackDatabase: Track[],
  carParts: PlayerStats["carParts"],
  riskAggression: number = 0,
): number {
  if (lapsCompleted <= 0) return 3.0; // Fail-safe
  const track =
    trackDatabase.find((t) => t.id === trackId) ||
    trackDatabase.find((t) => t.id === "custom")!;
  const trackMultiplier = SEVERITY_MULTIPLIERS[track.fuelSeverity];

  let partsFuelMultiplier = 1.0;
  if (carParts) {
    const p = carParts;
    const engineCost = (p.engine - 1) * 0.015;
    const electronicsBonus = (p.electronics - 1) * 0.012;
    partsFuelMultiplier += engineCost - electronicsBonus;
  }

  const riskFuelCost = riskAggression * 0.0005;

  const fuelPerLap = fuelConsumed / lapsCompleted;

  return fuelPerLap / (trackMultiplier * (partsFuelMultiplier + riskFuelCost));
}

/**
 * Reverse calculate Base Wear Multiplier from past stint data
 */
export function calculateBaseWearMultiplier(
  trackId: string,
  compound: TyreCompound,
  wearConsumed: number,
  lapsCompleted: number,
  avgTemp: number,
  aggression: number,
  trackDatabase: Track[],
  player: PlayerStats,
  driverWeight: number = 80,
): number {
  if (lapsCompleted <= 0) return 1.0; // Fail-safe
  const track =
    trackDatabase.find((t) => t.id === trackId) ||
    trackDatabase.find((t) => t.id === "custom")!;

  const baseRate = COMPOUND_WEAR_RATE[compound];
  const trackMultiplier = SEVERITY_MULTIPLIERS[track.wearSeverity];

  let tempMultiplier = 1.0;
  const tempDiff = avgTemp - COMPOUND_IDEAL_TEMP[compound];
  if (tempDiff > 0) {
    tempMultiplier += tempDiff * 0.025;
  } else if (tempDiff < 0) {
    tempMultiplier += tempDiff * 0.008;
  }
  tempMultiplier = Math.max(0.7, tempMultiplier);

  const aggressionMultiplier = 1.0 + aggression * 0.002;

  let partsWearMultiplier = 1.0;
  if (player.carParts) {
    const p = player.carParts;
    const chassisBonus = (p.chassis - 1) * 0.012;
    const suspensionBonus = (p.suspension - 1) * 0.015;
    const aeroBrakesCost =
      ((p.frontWing + p.rearWing + p.brakes) / 3 - 1) * 0.004;
    partsWearMultiplier -= chassisBonus + suspensionBonus;
    partsWearMultiplier += aeroBrakesCost;
  }

  const concentrationPenalty = Math.max(0, 250 - player.driverFocus) * 0.0001;
  const staminaPenalty = Math.max(0, 250 - player.driverStamina) * 0.0002;
  const expBonus = player.driverExperience * 0.0001;

  const baseWeight = 80;
  let weightWearMultiplier = 1.0;
  if (driverWeight) {
    const wDiff = driverWeight - baseWeight;
    weightWearMultiplier += wDiff * 0.001;
  }

  const driverStatsMultiplier =
    (1.0 + concentrationPenalty + staminaPenalty - expBonus) *
    weightWearMultiplier;

  let supplierWearMult = 1.0;
  const supp = player.tyreSupplier;
  if (supp === "Pipirelli") supplierWearMult = 1.05;
  else if (supp === "Avonn") supplierWearMult = 1.08;
  else if (supp === "Contimental") supplierWearMult = 1.0;
  else if (supp === "Dunnolop") supplierWearMult = 0.95;
  else if (supp === "Yokohama") supplierWearMult = 0.98;
  else if (supp === "Michelin") supplierWearMult = 0.92;
  else if (supp === "Bridgestone") supplierWearMult = 0.94;
  else if (supp === "Hancock") supplierWearMult = 1.02;

  const globalGproWearCalibrator = 1.55;

  const wearPerLap = wearConsumed / lapsCompleted;

  const knownFactors =
    baseRate *
    trackMultiplier *
    tempMultiplier *
    aggressionMultiplier *
    partsWearMultiplier *
    driverStatsMultiplier *
    supplierWearMult *
    globalGproWearCalibrator;

  return wearPerLap / knownFactors;
}
