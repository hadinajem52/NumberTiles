export const Colors = {
  // Text colors
  darkText: '#776e65',
  lightText: '#ffffff',
  accentText: '#8d6e63',
  scoreText: '#ffffff',
  
  // UI element colors
  primaryButton: '#c8a165',
  secondaryButton: '#a1887f',
};

// Add default font family to ensure consistency
const defaultFont = 'Nunito-Bold';

export const Typography = {
  // Text styles
  header: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: Colors.darkText,
  },
  subheader: {
    fontFamily: 'Nunito-Bold', // Changed from Medium to Bold
    fontSize: 20,
    color: Colors.darkText,
  },
  body: {
    fontFamily: 'Nunito-Bold', // Changed from Regular to Bold
    fontSize: 16,
    color: Colors.darkText,
  },
  caption: {
    fontFamily: 'Nunito-Bold', // Changed from Regular to Bold
    fontSize: 12,
    color: Colors.accentText,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: Colors.lightText,
  },
  
  // Specific number styles
  score: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: Colors.scoreText,
  },
  highScore: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: Colors.scoreText,
  },
  timeValue: {
    fontFamily: 'Nunito-Bold', // Changed from Medium to Bold
    fontSize: 20,
    color: Colors.darkText,
  },
  
  // Tile number styles based on value size
  tileNumber: {
    base: {
      fontFamily: 'Nunito-Bold',
    },
    small: {
      fontSize: 18, // for values >= 10000
    },
    medium: {
      fontSize: 20, // for values >= 1000
    },
    large: {
      fontSize: 24, // for values >= 100
    },
    larger: {
      fontSize: 28, // for values >= 10
    },
    largest: {
      fontSize: 32, // for values < 10
    }
  },
  
  // Label styles
  label: {
    fontFamily: 'Nunito-Bold', // Changed from SemiBold to Bold
    fontSize: 12,
    color: Colors.accentText,
    textTransform: 'uppercase',
  }
};

// Helper function to get tile text size based on value
export const getTileTextSize = (value) => {
  if (value >= 10000) return Typography.tileNumber.small.fontSize;
  if (value >= 1000) return Typography.tileNumber.medium.fontSize;
  if (value >= 100) return Typography.tileNumber.large.fontSize;
  if (value >= 10) return Typography.tileNumber.larger.fontSize;
  return Typography.tileNumber.largest.fontSize;
};

export default Typography;