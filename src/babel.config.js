module.exports = {
  presets: [
    [
      '@babel/preset-env',
      { shippedProposals: true, useBuiltIns: 'usage', corejs: '3' },
    ],
    [
      '@babel/preset-react',
      {
        development: process.env.NODE_ENV === 'production',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
  ],
};
