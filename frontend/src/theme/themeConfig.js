// src/theme/themeConfig.js
// Centralized theme configuration for all 11 Empathy Guru themes

/**
 * All 11 themes with their exact specified accent colours and assets.
 * When `default` is selected:
 * - backgroundImage is null (restores original background)
 * - accentColor is #4F46E5
 * - ambientSound uses `/sounds/default.mp3.mp3`
 * - sidebarBg uses original default `#1a237e`
 * For each custom theme:
 * - sidebarBg uses the theme's exact accent colour so the sidebar prominently reflects the chosen theme!
 */
export const THEME_CONFIGS = [
  {
    themeId: "default",
    themeName: "Default",
    accentColor: "#4F46E5",
    soundLabel: "Original Ambience",
    backgroundImage: null,
    ambientSound: "/sounds/default.mp3.mp3",
    sidebarBg: "#1a237e",
    isDefault: true,
  },
  {
    themeId: "beach",
    themeName: "Beach",
    accentColor: "#5F9CA2",
    soundLabel: "Ocean Waves",
    backgroundImage: "/themes/beach.jpg.jpg",
    ambientSound: "/sounds/beach.mp3.mp3",
    sidebarBg: "#5F9CA2",
  },
  {
    themeId: "cloudy",
    themeName: "Cloudy",
    accentColor: "#039BE5",
    soundLabel: "Gentle Wind",
    backgroundImage: "/themes/cloudy.jpg.jpg",
    ambientSound: "/sounds/cloudy.mp3.mp3",
    sidebarBg: "#039BE5",
  },
  {
    themeId: "dreamy_night",
    themeName: "Dreamy Night",
    accentColor: "#DBB1E1",
    soundLabel: "Night Ambience",
    backgroundImage: "/themes/dreamy-night.jpg.jpg",
    ambientSound: "/sounds/dreamy-night.mp3.mp3",
    sidebarBg: "#DBB1E1",
  },
  {
    themeId: "forest",
    themeName: "Forest",
    accentColor: "#046307",
    soundLabel: "Forest Ambience",
    backgroundImage: "/themes/forest.jpg.jpg",
    ambientSound: "/sounds/forest.mp3.mp3",
    sidebarBg: "#046307",
  },
  {
    themeId: "lantern",
    themeName: "Lantern",
    accentColor: "#F5B332",
    soundLabel: "Warm Glow / Night Ambience",
    backgroundImage: "/themes/lantern.jpg.jpg",
    ambientSound: "/sounds/lantern.mp3.mp3",
    sidebarBg: "#F5B332",
  },
  {
    themeId: "rainy",
    themeName: "Rainy",
    accentColor: "#C4A484",
    soundLabel: "Rainfall",
    backgroundImage: "/themes/rainy.jpg.jpg",
    ambientSound: "/sounds/rainy.mp3.mp3",
    sidebarBg: "#C4A484",
  },
  {
    themeId: "rich_town",
    themeName: "Rich Town",
    accentColor: "#554433",
    soundLabel: "Soft Jazz / City Ambience",
    backgroundImage: "/themes/rich-town.jpg.jpg",
    ambientSound: "/sounds/rich-town.mp3.mp3",
    sidebarBg: "#554433",
  },
  {
    themeId: "village",
    themeName: "Village",
    accentColor: "#89A577",
    soundLabel: "Birds / Gentle Breeze",
    backgroundImage: "/themes/village.jpg.jpg",
    ambientSound: "/sounds/village.mp3.mp3",
    sidebarBg: "#89A577",
  },
  {
    themeId: "winter",
    themeName: "Winter",
    accentColor: "#C7C9CC",
    soundLabel: "Gentle Wind",
    backgroundImage: "/themes/winter.jpg.jpg",
    ambientSound: "/sounds/winter.mp3.mp3",
    sidebarBg: "#C7C9CC",
  },
  {
    themeId: "zen_garden",
    themeName: "Zen Garden",
    accentColor: "#C0403E",
    soundLabel: "Peaceful Nature",
    backgroundImage: "/themes/zen-garden.jpg.jpg",
    ambientSound: "/sounds/zen-garden.mp3.mp3",
    sidebarBg: "#C0403E",
  },
];

export const DEFAULT_THEME_ID = "default";

export function getThemeConfig(themeId) {
  const legacyMap = {
    ocean: "default",
    sunset: "lantern",
    lavender: "dreamy_night",
    dreaming: "zen_garden",
    spring_garden: "lantern",
  };
  const normalizedId = legacyMap[themeId] || themeId;
  const found = THEME_CONFIGS.find((t) => t.themeId === normalizedId);
  return found || THEME_CONFIGS[0];
}
