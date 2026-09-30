// Central asset registry for generated high-resolution commercial graphics
import solnexaHeaderBanner from './images/solnexa_header_banner_1790485523729.jpg';
import solnexaAppLogo from './images/solnexa_app_logo_1790485535199.jpg';
import solarBessFacility from './images/solar_bess_facility_1790485548273.jpg';
import bessContainerRender from './images/bess_container_render_1790485559260.jpg';
import ambientHomeBg from './images/ambient_home_bg_1790497656537.jpg';
import brightSolarLandscape from './images/bright_solar_landscape_1790637264202.jpg';
import cleanBessFacility from './images/clean_bess_facility_1790637281238.jpg';
import solarFrontierDaylight from './images/solar_frontier_daylight_1790637574112.jpg';
import cleanWhiteSubstation from './images/clean_white_substation_1790637586669.jpg';
import rooftopSolarDaylight from './images/rooftop_solar_daylight_1790805810632.jpg';
import smartEmsDaylight from './images/smart_ems_daylight_1790805823450.jpg';

export const APP_IMAGES = {
  headerBanner: solnexaHeaderBanner,
  appLogo: solnexaAppLogo,
  logo: solnexaAppLogo,
  solarFacility: solarBessFacility,
  bessContainer: bessContainerRender,
  ambientHomeBg: ambientHomeBg,
  ambientBg: ambientHomeBg,
  brightSolarLandscape: brightSolarLandscape,
  cleanBessFacility: cleanBessFacility,
  solarFrontierDaylight: solarFrontierDaylight,
  cleanWhiteSubstation: cleanWhiteSubstation,
  rooftopSolarDaylight: rooftopSolarDaylight,
  smartEmsDaylight: smartEmsDaylight,
} as const;

export default APP_IMAGES;
