export const lightPalette = {
  background: "#F4F0E6",
  surface: "#FFFCF4",
  surfaceRaised: "#FFFFFF",
  ink: "#17231C",
  muted: "#57635B",
  faint: "#776F63",
  line: "#CBC4B6",
  pine: "#176B4D",
  pineSoft: "#DDECE4",
  cobalt: "#2457D6",
  cobaltSoft: "#E2E9FF",
  amber: "#8D5700",
  amberSoft: "#F8E8BE",
  brick: "#A43628",
  brickSoft: "#F4DDD8",
  cameraOverlay: "rgba(8, 16, 12, 0.68)",
  onStrong: "#FFFFFF",
} as const;

export const darkPalette = {
  background: "#101713",
  surface: "#18221D",
  surfaceRaised: "#202C25",
  ink: "#F5F0E6",
  muted: "#C3CDC5",
  faint: "#AFA799",
  line: "#465149",
  pine: "#63D1A2",
  pineSoft: "#1B3B2E",
  cobalt: "#91ACFF",
  cobaltSoft: "#24355F",
  amber: "#F4C765",
  amberSoft: "#493817",
  brick: "#FF9A8B",
  brickSoft: "#512923",
  cameraOverlay: "rgba(4, 8, 6, 0.72)",
  onStrong: "#101713",
} as const;

export type AppPalette = {
  readonly [Key in keyof typeof lightPalette]: string;
};
