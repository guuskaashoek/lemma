/**
 * All unit bundles, in roadmap order. This is the only place that lists the
 * units; everything else (roadmap, generators, skills, rule cards) is derived
 * from these bundles.
 */
import type { UnitBundle } from "@/content/types";
import { bundle as u00 } from "./u00";
import { bundle as u01 } from "./u01";
import { bundle as u02 } from "./u02";
import { bundle as u03 } from "./u03";
import { bundle as u04 } from "./u04";
import { bundle as u05 } from "./u05";
import { bundle as u06 } from "./u06";
import { bundle as u07 } from "./u07";
import { bundle as u08 } from "./u08";
import { bundle as u09 } from "./u09";
import { bundle as u10 } from "./u10";
import { bundle as u11 } from "./u11";
import { bundle as u12 } from "./u12";

export const BUNDLES: UnitBundle[] = [u00, u01, u02, u03, u04, u05, u06, u07, u08, u09, u10, u11, u12];
