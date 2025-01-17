

This configuration for a **WIND** button in **CockpitDecks** uses **Reverse Polish Notation (RPN)** for its calculations, incorporating **cosine and sine** mathematical operations to visualise wind components:

- **Displays:** Headwind, Tailwind, Left Crosswind, and Right Crosswind
- **Visuals:** Yellow text, size 28, with directional symbols (↓, ↑, →, ←) for intuitive pilot reference.

This setup enhances situational awareness by clearly indicating how wind affects the aircraft's flight path.


``` yaml title="WIND DATA"
- index: 5
  name: WIND
  label: WIND DATA
  label-color: Black
  label-size: 10
  type: none
  annunciator:
    size: medium
    model: F
    parts:
      F0: # Headwind RPN: [Wind Direction] [Aircraft Heading] - cos [Wind Speed] *
        color: yellow
        text-size: 28
        formula: "${sim/cockpit2/gauges/indicators/wind_heading_deg_mag} ${sim/cockpit2/gauges/indicators/compass_heading_deg_mag} - cos ${sim/cockpit2/gauges/indicators/wind_speed_kts} *"
        text-font: fontawesome.otf
        text: "↓ ${formula}"
        text-format: "{0:.0f}"
      F2: # Tailwind RPN: [Wind Direction] 180 + [Aircraft Heading] - cos [Wind Speed] *
        color: yellow
        text-size: 28
        formula: "${sim/cockpit2/gauges/indicators/wind_heading_deg_mag} 180 + ${sim/cockpit2/gauges/indicators/compass_heading_deg_mag} - cos ${sim/cockpit2/gauges/indicators/wind_speed_kts} *"
        text-font: fontawesome.otf
        text: "↑ ${formula}"
        text-format: "{0:.0f}"
      F1: # Crosswind L RPN: [Wind Direction] 180 + [Aircraft Heading] - sin [Wind Speed] *
        color: yellow
        text-size: 28
        formula: "${sim/cockpit2/gauges/indicators/wind_heading_deg_mag} 180 + ${sim/cockpit2/gauges/indicators/compass_heading_deg_mag} - sin ${sim/cockpit2/gauges/indicators/wind_speed_kts} *"
        text-font: fontawesome.otf
        text: "→ ${formula}"
        text-format: "{0:.0f}"
      F3: # Crosswind R RPN: [Wind Direction] [Aircraft Heading] - sin [Wind Speed] *
        color: yellow
        text-size: 28
        formula: "${sim/cockpit2/gauges/indicators/wind_heading_deg_mag} ${sim/cockpit2/gauges/indicators/compass_heading_deg_mag} - sin ${sim/cockpit2/gauges/indicators/wind_speed_kts} *"
        text-font: fontawesome.otf
        text: "← ${formula}"
        text-format: "{0:.0f}"
```