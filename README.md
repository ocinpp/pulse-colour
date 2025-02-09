# Pulse Color App

## Overview

Pulse Color App is an interactive web application that generates and displays colors based on user interaction. It features a central circle that changes color when pressed, and provides the user with the color's name and hex code.

## Features

- Interactive color generation based on press duration
- Display of color name and hex code
- Approximate color naming for non-exact matches
- Responsive design for various screen sizes
- Ripple effect on button release
- Smooth animations for color information display

## Technologies Used

- React
- Next.js
- TypeScript
- CSS Modules
- color-name-list (for color naming)
- nearest-color (for approximate color matching)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone <https://github.com/your-username/pulse-color-app.git>
   cd pulse-color-app
   ```

2. Install dependencies:

   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Run the development server:

   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## How to Use

1. When you open the app, you'll see a large circle in the center of the screen.
2. Press and hold the circle to generate a color. The longer you hold, the more the color will change.
3. Release the circle to set the background to the generated color.
4. The color's name and hex code will appear at the top of the screen.
5. If the exact color name isn't found, an approximate name will be shown, prefixed with "~".

## Project Structure

- `app/`: Contains the main application files
  - `layout.tsx`: Defines the overall layout of the app
  - `page.tsx`: Main component with the color generation logic
  - `page.module.css`: Styles for the main component
  - `globals.css`: Global styles
- `public/`: Public assets (if any)

## Customization

- To change the initial color palette, modify the `colorPalette` array in `app/page.tsx`.
- Adjust the color generation algorithm in the `generateColor` function in `app/page.tsx`.
- Modify styles in `app/page.module.css` to change the appearance of the app.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Color naming data provided by [color-name-list](https://github.com/meodai/color-names)
- Nearest color matching by [nearest-color](https://github.com/dtao/nearest-color)
